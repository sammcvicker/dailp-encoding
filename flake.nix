{
  inputs = {
    pkgs.url = "github:nixos/nixpkgs/nixos-21.11";
    pkgs-unstable.url = "github:nixos/nixpkgs/master";
    # Lock a version of nixpkgs that matches our MongoDB instances.
    nixpkgs-server.url = "github:nixos/nixpkgs/nixos-21.05";
    utils.url = "github:numtide/flake-utils";
    # Provides cargo dependencies.
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "pkgs";
    };
    # Builds rust projects.
    naersk = {
      url = "github:nmattia/naersk";
      inputs.nixpkgs.follows = "pkgs";
    };
    nix-filter.url = "github:numtide/nix-filter";
  };

  outputs = inputs:
    inputs.utils.lib.eachDefaultSystem (system:
      let
        pkgs = import inputs.pkgs {
          inherit system;
          config.allowUnfree = true;
        };
        pkgs-unstable = import inputs.pkgs-unstable { inherit system; };
        nixpkgs-server = import inputs.nixpkgs-server {
          inherit system;
          config.allowUnfree = true;
        };
        fenix = inputs.fenix.packages.${system};
        toolchainFile = {
          file = ./rust-toolchain.toml;
          sha256 = "6PfBjfCI9DaNRyGigEmuUP2pcamWsWGc4g7SNEHqD2c=";
        };
        rust-toolchain = fenix.fromToolchainFile toolchainFile;
        naersk = inputs.naersk.lib.${system}.override {
          cargo = rust-toolchain;
          rustc = rust-toolchain;
        };
        filter = inputs.nix-filter.lib;
        packageSrc = filter.filter {
          root = ./.;
          include = [
            (filter.inDirectory "types")
            (filter.inDirectory "graphql")
            (filter.inDirectory "migration")
            ./Cargo.toml
            ./Cargo.lock
            ./rust-toolchain
          ];
        };
        # The rust compiler is internally a cross compiler, so a single
        # toolchain can be used to compile multiple targets. In a hermetic
        # build system like nix flakes, there's effectively one package for
        # every permutation of the supported hosts and targets.
        targetPackage = let
          target = "x86_64-unknown-linux-musl";
          pkgsCross = import inputs.pkgs {
            inherit system;
            crossSystem.config = target;
          };
          cc = pkgsCross.pkgsStatic.stdenv.cc;
        in naersk.buildPackage {
          root = ./.;
          src = packageSrc;
          doCheck = true;

          nativeBuildInputs = [ cc ];

          # Configures the target which will be built.
          # ref: https://doc.rust-lang.org/cargo/reference/config.html#buildtarget
          CARGO_BUILD_TARGET = target;
          TARGET_CC = "${cc}/bin/${target}-gcc";
          CARGO_BUILD_RUSTFLAGS = "-C target-feature=+crt-static";
        };
        hostPackage = naersk.buildPackage {
          root = ./.;
          src = packageSrc;
        };
        dailpFunctions = with pkgs;
          stdenv.mkDerivation {
            name = "dailp-functions";
            buildInputs = [ zip ];
            # Permits a derivation with no source files.
            unpackPhase = "true";
            installPhase = ''
              mkdir -p $out
              cp -f ${targetPackage}/bin/dailp-graphql $out/bootstrap
              zip -j $out/dailp-graphql.zip $out/bootstrap
            '';
          };
        terraformConfig = pkgs.writeTextFile {
          name = "terraform-config";
          text = let
            tf = import "${pkgs.terranix}/core/default.nix" {
              inherit pkgs;
              terranix_config = {
                imports = [ ./terraform/main.nix ];
                functions.package_path = "${dailpFunctions}";
              };
              strip_nulls = true;
            };
          in builtins.toJSON (tf.config);
          executable = false;
          destination = "/config.tf.json";
        };
        mkBashApp = name: script:
          inputs.utils.lib.mkApp {
            drv = pkgs.writers.writeBashBin name script;
            exePath = "/bin/${name}";
          };
        tf = "${pkgs.terraform}/bin/terraform";
        tfInit = ''
          cp -f ${terraformConfig}/config.tf.json ./
          export TF_DATA_DIR=$(pwd)/.terraform
          ${tf} init
        '';
      in rec {
        # Add extra binary caches for quicker builds of the rust toolchain and MongoDB.
        nixConfig = {
          binaryCaches =
            [ "https://nix-community.cachix.org" "https://dailp.cachix.org" ];
          binaryCachePublicKeys = [
            "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
            "dailp.cachix.org-1:QKIYFfTB/jrD6J8wZoBEpML64ONrIxs3X5ifSKoJ3kA="
          ];
        };

        defaultPackage = terraformConfig;

        apps.migrate-data = inputs.utils.lib.mkApp {
          drv = hostPackage;
          exePath = "/bin/dailp-migration";
        };

        apps.tf-plan = mkBashApp "plan" ''
          ${tfInit}
          ${tf} plan
        '';

        apps.tf-apply = mkBashApp "apply" ''
          ${tfInit}
          ${tf} apply
        '';

        apps.tf-apply-now = mkBashApp "apply-now" ''
          ${tfInit}
          ${tf} apply -auto-approve
        '';

        apps.tf-output = mkBashApp "tf-output" ''
          ${tf} output $1 | xargs
        '';

        devShell = with pkgs;
          mkShell rec {
            name = "dailp-dev";
            unpackPhase = "true";
            RUST_LOG = "info";
            LD_LIBRARY_PATH = "${lib.makeLibraryPath buildInputs}";
            shellHook = ''
              export PROJECT_ROOT=$PWD
            '';
            buildInputs = let
              dev-database = (writers.writeBashBin "dev-database" ''
                mkdir -p $PROJECT_ROOT/.mongo
                mongod --dbpath $PROJECT_ROOT/.mongo
              '');
              dev-graphql = (writers.writeBashBin "dev-graphql" ''
                cargo run --bin dailp-graphql-local
              '');
              dev-website = (writers.writeBashBin "dev-website" ''
                cd $PROJECT_ROOT/website
                yarn install
                yarn dev
              '');
              in-parallel = writeShellScript "in-parallel" ''
                (trap 'kill 0' SIGINT; $@)
              '';
              dev-start = writers.writeBashBin "dev-start" ''
                ${in-parallel} ${dev-database}/bin/dev-database & ${dev-graphql}/bin/dev-graphql & ${dev-website}/bin/dev-website
              '';
            in [
              autoconf
              automake
              libtool
              pkg-config
              file
              nasm
              terraform
              rust-toolchain
              nodejs-14_x
              yarn
              nixpkgs-server.mongodb-4_2
              docker
              pkgs-unstable.act
              (writers.writeBashBin "dev-migrate" ''
                cargo run --bin dailp-migration
              '')
              dev-database
              dev-graphql
              dev-website
              dev-start
            ] ++ lib.optionals stdenv.isDarwin [
              darwin.apple_sdk.frameworks.Security
              libiconv
            ];
          };
      });
}
