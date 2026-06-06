package com.hikariforge.store;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Punto de entrada de la aplicación. @SpringBootApplication activa la
// autoconfiguración, el escaneo de componentes y la configuración por defecto.
@SpringBootApplication
public class HikariForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(HikariForgeApplication.class, args);
    }
}
