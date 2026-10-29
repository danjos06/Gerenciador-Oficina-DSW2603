create database oficina;
use oficina;

create table clientes(
id int auto_increment primary key,
nome varchar(100) not null,
cpf varchar(14) unique,
telefone varchar(20),
email varchar(100)
);

create table veiculos(
Id int auto_increment primary key,
cliente_id int not null,
modelo varchar(50),
placa varchar(8) not null unique,
ano year, 
foreign key (cliente_id) references clientes(id)
);