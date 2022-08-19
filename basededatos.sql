CREATE TABLE usuarios
 (id serial primary KEY,
 nombre varchar(50) not null, 
 balance float check (balance >= 0) not null);

create table transferencias (
    id serial primary key,
    emisor int ,
    receptor int,
    monto float,
    fecha timestamp default now(),
    foreign key (emisor) references usuarios(id),
    foreign key (receptor) references usuarios(id)
);

 SELECT fecha, emisores.nombre as emisor, receptores.nombre as receptor, monto FROM transferencias   JOIN usuarios as emisores ON emisor=emisores.id   join usuarios as receptores on receptor= receptores.id;
