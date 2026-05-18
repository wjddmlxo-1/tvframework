package tvframework.com.security;

import tvframework.com.cmm.filter.HTMLTagFilter;
import tvframework.com.jwt.JwtAuthenticationEntryPoint;
import tvframework.com.jwt.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.util.unit.DataSize;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.multipart.support.MultipartFilter;

import java.util.Arrays;

import jakarta.servlet.MultipartConfigElement;

/**
 * fileName : SecurityConfig
 * author : crlee
 * date : 2023/06/10
 * description :
 * ===========================================================
 * DATE AUTHOR NOTE
 * -----------------------------------------------------------
 * 2023/06/10 crlee 최초 생성
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Http Methpd : Get 인증예외 List
    private String[] AUTH_GET_WHITELIST = {
            "/mainPage", // 메인 화면 리스트 조회
            "/widget/widgetImage", // 위젯 썸네일(img src는 Authorization 헤더 미전송)
            "/bbs/main/post/file", // 사용자 게시판 첨부 바이너리(img·다운로드 링크는 Authorization 미전송)
            "/bbs/main/comment/file", // 사용자 게시판 댓글 첨부 이미지(<img>는 Authorization 미전송)
            "/bbs/main/profile/file", // 사용자 프로필 이미지(<img>는 Authorization 미전송)
            "/schedule/daily", // 일별 일정 조회
            "/schedule/week", // 주간 일정 조회
            "/schedule/{schdulId}", // 일정 상세조회
            "/image", // 갤러리 이미지보기
            "/cmmnMessage/languages", // 언어 목록 조회 단일 소스 (로그인 전/후 모두 접근 가능)
            "/cmmnMessage/texts", // 다국어 키 일괄 조회 (화면 UI 문구 한 번에 조회)
            "/cmmnCompany/stplat", // 회원가입 약관 조회
            "/cmmnCompany/checkDuplicate", // 회원가입 회사ID 중복검사
            "/cmmnCompany/codeOption", // 회원가입 코드옵션
    };

    // 인증 예외 List
    private String[] AUTH_WHITELIST = {
            "/",
            "/login/**",
            "/auth/login-jwt", // JWT 로그인
            "/auth/login", // 일반 로그인
            "/cmmnCompany/join", // 회원가입(회사 가입신청)
            "/error", // 서버 오류 시 포워드되는 경로 (인증 없이 오류 응답 반환)
            "/file", // 파일 다운로드
            "/etc/**", // 사용자단의 회원약관,회원가입,사용자아이디 중복여부체크 URL허용
            "/cmmnCompany/stplat",
            "/cmmnCompany/join",
            "/cmmnCompany/checkDuplicate",
            "/cmmnCompany/codeOption",

            /* swagger / springdoc */
            "/v3/api-docs/**",
            "/swagger-resources",
            "/swagger-resources/**",
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/swagger-ui/index.html",
            "/api-docs/**",
            "/api-docs",
            "/swagger-config",
            "/webjars/**", // Swagger UI 리소스

    };
    private static final String[] ORIGINS_WHITELIST = {
            "http://localhost:3000",
    };

    @Bean
    public JwtAuthenticationFilter authenticationTokenFilterBean() throws Exception {
        return new JwtAuthenticationFilter();
    }
    
    @Bean
    public JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint() {
        return new JwtAuthenticationEntryPoint();
    }

    @Bean
    protected CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("HEAD", "POST", "GET", "DELETE", "PUT", "PATCH", "OPTIONS"));
        configuration.setAllowedOrigins(Arrays.asList(ORIGINS_WHITELIST));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // preflight 요청 캐시 시간

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public CharacterEncodingFilter characterEncodingFilter() {
        CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
        characterEncodingFilter.setEncoding("UTF-8");
        characterEncodingFilter.setForceEncoding(true);
        return characterEncodingFilter;
    }

    @Bean
    public HTMLTagFilter htmlTagFilter() {
        return new HTMLTagFilter();
    }

    // 멀티파트 필터 빈
    @Bean
    public MultipartFilter multipartFilter() {
        return new MultipartFilter();
    }

    // 서블릿 컨테이너에 멀티파트 구성을 제공하기 위한 설정
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        return new MultipartConfigElement(
            "", // location
            DataSize.ofMegabytes(100L).toBytes(), // maxFileSize
            DataSize.ofMegabytes(100L).toBytes(), // maxRequestSize
            0 // fileSizeThreshold
        );
    }

    @Bean
    protected SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // CORS preflight 요청 허용
                        // 인증이 필요 없는 경로를 먼저 명시적으로 처리 (순서 중요!)
                        .requestMatchers("/auth/login-jwt").permitAll() // JWT 로그인 명시적 허용
                        .requestMatchers("/auth/login").permitAll() // 일반 로그인 명시적 허용
                        .requestMatchers("/mypage/create").permitAll()
                        .requestMatchers(AUTH_WHITELIST).permitAll()
                        .requestMatchers(HttpMethod.GET, AUTH_GET_WHITELIST).permitAll()
                        .requestMatchers("/user/**").hasRole("ADMIN") // 사용자관리·사용자 암호변경은 ADMIN만 접근
                        .requestMatchers("/mypage/**").hasAnyRole("ADMIN", "USER") // 마이페이지는 ADMIN, USER 모두 접근
                        .requestMatchers("/inform/**").hasAnyRole("ADMIN", "USER") // 게시판은 ADMIN, USER 모두 접근
                        .anyRequest().authenticated())
                .sessionManagement(
                        (sessionManagement) -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(Customizer.withDefaults())
                .addFilterBefore(characterEncodingFilter(), UsernamePasswordAuthenticationFilter.class)
                // JWT 필터는 인증이 필요한 경로에만 적용되도록 shouldNotFilter에서 처리
                // 필터는 permitAll() 경로에서도 실행되지만, shouldNotFilter로 건너뛰도록 설정됨
                .addFilterBefore(authenticationTokenFilterBean(), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(multipartFilter(), CsrfFilter.class)
                // permitAll() 경로에 대해서는 인증 실패 시 401을 반환하지 않도록 설정
                .exceptionHandling(exceptionHandlingConfigurer -> exceptionHandlingConfigurer
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint()))
                .build();
    }

}