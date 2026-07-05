package com.hikariforge.store.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

// Correo saliente con interruptor: si app.mail.enabled=false (por defecto),
// el correo se imprime en la consola (modo desarrollo, sin cuenta SMTP).
// Con enabled=true y credenciales SMTP en variables de entorno, se envía real.
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;

    public EmailService(JavaMailSender mailSender,
                        @Value("${app.mail.enabled}") boolean enabled,
                        @Value("${app.mail.from}") String from) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.from = from;
    }

    // Envía un correo HTML. Nunca lanza excepción hacia fuera: el fallo de un
    // email no debe romper la operación que lo origina (p. ej. crear un pedido).
    public void enviar(String para, String asunto, String html) {
        if (!enabled) {
            log.info("\n===== EMAIL (modo desarrollo, no enviado) =====\nPara: {}\nAsunto: {}\n{}\n===============================================",
                    para, asunto, html);
            return;
        }
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, "UTF-8");
            helper.setFrom(from);
            helper.setTo(para);
            helper.setSubject(asunto);
            helper.setText(html, true); // true = contenido HTML
            mailSender.send(mensaje);
        } catch (Exception e) {
            log.error("No se pudo enviar el email a {}: {}", para, e.getMessage());
        }
    }
}
