CREATE TABLE IF NOT EXISTS users
(
    user_id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 ),
    username varchar(32) NOT NULL,
    email varchar(256) NOT NULL,
    password varchar(128) NOT NULL,
    logged_in boolean NOT NULL DEFAULT false,
    uat varchar(128) NULL,
    elo integer NOT NULL DEFAULT 1000,
    completed_game_count integer NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id),
    CONSTRAINT "user_id_UNIQUE" UNIQUE (user_id),
    CONSTRAINT "username_UNIQUE" UNIQUE (username),
    CONSTRAINT "email_UNIQUE" UNIQUE (email)
);

ALTER TABLE IF EXISTS users
    OWNER to postgres;
	
GRANT ALL ON TABLE users TO postgres;