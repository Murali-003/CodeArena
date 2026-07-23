package com.codearena.service.impl;

import com.codearena.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import java.time.Year;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public EmailServiceImpl(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Override
    public void sendWelcomeEmail(String to, String username) {

        try {

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Welcome to CodeArena!");

Context context = new Context();

context.setVariable("username", username);
context.setVariable("email", to);
context.setVariable("loginUrl", frontendUrl);
context.setVariable("currentYear", Year.now().getValue());
context.setVariable("teamName", "CodeArena Team");

String html = templateEngine.process("welcome-email", context);

            helper.setText(html, true);

            mailSender.send(message);

        } 
        catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }

    }
}