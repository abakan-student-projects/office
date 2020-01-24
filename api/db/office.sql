create  schema office collate utf8mb4_general_ci;

create table Contracts
(
    id bigint auto_increment
        primary key,
    userId bigint null,
    periodId bigint null,
    xml mediumtext null,
    createdAt datetime null,
    updatedAt datetime null
);

create index Contracts_createdAt_index
    on Contracts (createdAt);

create table Periods
(
    id bigint auto_increment
        primary key,
    name text null,
    path text null,
    createdAt datetime null,
    updatedAt datetime null,
    active tinyint(1) default 0 not null
);

create table Users
(
    id bigint auto_increment
        primary key,
    email varchar(512) null,
    firstName varchar(128) null,
    middleName varchar(128) null,
    lastName varchar(512) null,
    passwordHash varchar(1024) null,
    passwordSalt varchar(512) null,
    createdAt datetime null,
    updatedAt datetime null,
    isAdmin tinyint(1) default 0 not null,
    constraint Users_email_uindex
        unique (email)
);