{ lib, config, ... }: {
  config = {
    module.github-runner = {
      source = "philips-labs/github-runner/aws";
      version = "2.0.0-next.1";

      aws_region = config.provider.aws.region;
      vpc_id = config.setup.vpc;
      subnet_ids = config.setup.subnets;

      environment = "gh-ci";

      github_app = {
        key_base64 = "base64string";
        id = "1";
        webhook_secret = "webhook_secret";
      };

      webhook_lambda_zip = "lambdas-download/webhook.zip";
      runner_binaries_syncer_lambda_zip =
        "lambdas-download/runner-binaries-syncer.zip";
      runners_lambda_zip = "lambdas-download/runners.zip";
      enable_organization_runners = true;
    };
  };
}
