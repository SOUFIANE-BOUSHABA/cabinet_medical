package com.pt28.cabinetmedical.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Swagger / OpenAPI metadata and Bearer-token security scheme. */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI cabinetMedicalOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PT28 - Gestionnaire de Cabinet Medical API")
                        .description("REST API for the medical cabinet management system (patients, appointments, "
                                + "medical records, consultations, notifications, dashboards).")
                        .version("1.0.0")
                        .contact(new Contact().name("Equipe PT28")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME))
                .components(new Components().addSecuritySchemes(SECURITY_SCHEME,
                        new SecurityScheme()
                                .name(SECURITY_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste the JWT access token returned by a /auth login endpoint.")));
    }
}
