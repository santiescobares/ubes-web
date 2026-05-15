package dev.santiescobares.ubesweb;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Integration test — requires live Postgres, Redis and env vars. Run manually or in CI with infrastructure.")
class BootstrapTests {

	@Test
	void contextLoads() {
	}
}
