package dev.santiescobares.ubesweb;

import lombok.experimental.UtilityClass;

import java.time.LocalDate;
import java.time.Month;

@UtilityClass
public final class Global {

    public final String BASE_URL = "/api/v1";
    public final String PROD_URL = "http://localhost:5173";

    public final String ACCESS_TOKEN_COOKIE = "access_token";

    public final String R2_PUBLIC_URL = "https://pub-6e3ddb68c9054b32afce9c1d8ae47d40.r2.dev";
    public final String R2_USER_PICTURES_PATH = "user-pictures/";
    public final String R2_EVENT_BANNERS_PATH = "event-banners/";
    public final String R2_DOCUMENTS_PATH = "documents/";
    public final String R2_STUDENT_CERTIFICATES_PATH = "student-certificates/";
    public final String R2_MEDICAL_CERTIFICATES_PATH = "medical-certificates/";

    public final String REDIS_TOKEN_BLACKLIST_KEY = "token_blacklist:";
    public final String REDIS_FORCED_LOGOUT_KEY = "forced_logout:";

    public LocalDate COMPETITION_RESULTS_DEADLINE() {
        return LocalDate.of(LocalDate.now().getYear(), Month.SEPTEMBER, 22);
    }
}
