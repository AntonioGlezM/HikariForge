package com.hikariforge.store;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

// Punto de entrada de la aplicación. @SpringBootApplication activa la
// autoconfiguración, el escaneo de componentes y la configuración por defecto.
// VIA_DTO: las respuestas paginadas (Page) se serializan con una estructura
// JSON estable ({ content: [...], page: { size, number, totalElements,
// totalPages } }), como recomienda Spring Data (elimina el warning de PageImpl).
@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class HikariForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(HikariForgeApplication.class, args);
    }
}
