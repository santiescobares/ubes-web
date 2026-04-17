package dev.santiescobares.ubesweb.auth.token;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import dev.santiescobares.ubesweb.config.JwtConfig;
import dev.santiescobares.ubesweb.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtConfig jwtConfig;

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        return JWT.create()
                .withIssuer(jwtConfig.getIssuer())
                .withSubject(user.getGoogleId())
                .withJWTId(UUID.randomUUID().toString())
                .withClaim("type", TokenType.ACCESS.name())
                .withClaim("userId", user.getId().toString())
                .withClaim("role", user.getRole().name())
                .withIssuedAt(now)
                .withExpiresAt(now.plusMillis(jwtConfig.getAccessExpiration()))
                .sign(Algorithm.HMAC256(jwtConfig.getSecretKey()));
    }

    public String generateRegistrationToken(GoogleIdToken.Payload googlePayload) {
        Instant now = Instant.now();
        return JWT.create()
                .withIssuer(jwtConfig.getIssuer())
                .withSubject(googlePayload.getSubject())
                .withJWTId(UUID.randomUUID().toString())
                .withClaim("type", TokenType.REGISTRATION.name())
                .withClaim("firstName", (String) googlePayload.get("given_name"))
                .withClaim("lastName", (String) googlePayload.get("family_name"))
                .withClaim("email", googlePayload.getEmail())
                .withIssuedAt(now)
                .withExpiresAt(now.plusMillis(jwtConfig.getRegistrationExpiration()))
                .sign(Algorithm.HMAC256(jwtConfig.getSecretKey()));
    }

    public DecodedJWT decodeToken(String encodedToken) {
        try {
            return JWT.require(Algorithm.HMAC256(jwtConfig.getSecretKey()))
                    .withIssuer(jwtConfig.getIssuer())
                    .build()
                    .verify(encodedToken);
        } catch (Exception ignored) {
            return null;
        }
    }
}
