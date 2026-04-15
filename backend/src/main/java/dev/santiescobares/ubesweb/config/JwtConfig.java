package dev.santiescobares.ubesweb.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("spring.security.jwt")
@Getter
@Setter
public class JwtConfig {

    private String secretKey, issuer;
    private long accessExpiration;
}
