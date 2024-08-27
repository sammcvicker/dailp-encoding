update document set
    title = 
        case
            when $2::text[] != '{}' and $2[1] is not null then $2[1]
            else title
        end,
    genre = 
        case
            when $3::text[] != '{}' and $3[1] is not null then $3[1]
            else genre
        end,
    written_at =
        case
            when $4::date is not null then $4::date
            else written_at
        end
where id = $1
