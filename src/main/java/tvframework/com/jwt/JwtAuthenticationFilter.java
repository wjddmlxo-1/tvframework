package tvframework.com.jwt;

import tvframework.com.cmm.LoginVO;
import tvframework.let.utl.fcc.service.StringUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;

/**
 * fileName       : JwtAuthenticationFilter
 * author         : crlee
 * date           : 2023/06/11
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2023/06/11        crlee       최초 생성
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    public static final String HEADER_STRING = "Authorization";

    /**
     * 필터를 건너뛸 경로인지 확인
     * OncePerRequestFilter의 shouldNotFilter를 오버라이드하여 필터 자체를 실행하지 않음
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String requestPath = request.getRequestURI();
        // Context path 제거
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && requestPath.startsWith(contextPath)) {
            requestPath = requestPath.substring(contextPath.length());
        }
        
        // 빈 문자열이거나 "/"인 경우도 처리
        if (requestPath == null || requestPath.isEmpty()) {
            requestPath = "/";
        }
        
        boolean shouldSkip = shouldSkipAuthentication(requestPath);
        // 디버그 로그를 항상 출력하도록 변경 (문제 진단용)
        logger.info("JwtAuthenticationFilter shouldNotFilter: originalPath=" + request.getRequestURI() + ", path=" + requestPath + ", skip=" + shouldSkip);
        return shouldSkip;
    }

    @Override //로그인 이후 HttpServletRequest 요청할 때마다 실행(스프링의 AOP기능)
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        // 인증이 필요 없는 경로는 필터를 건너뜀 (이중 체크)
        String requestPath = req.getRequestURI();
        String contextPath = req.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && requestPath.startsWith(contextPath)) {
            requestPath = requestPath.substring(contextPath.length());
        }
        
        if (shouldSkipAuthentication(requestPath)) {
            chain.doFilter(req, res);
            return;
        }

        // step 1. request header에서 토큰을 가져온다.
        String jwtToken = StringUtil.isNullToString(req.getHeader(HEADER_STRING));


        // step 2. 토큰에 내용이 있는지 확인해서 id값을 가져옴
        // Exception 핸들링 추가처리 (토큰 유효성, 토큰 변조 여부, 토큰 만료여부)
        // 내부적으로 parse하는 과정에서 해당 여부들이 검증됨
        try {
            LoginVO loginVO = jwtTokenUtil.getLoginVOFromToken(jwtToken);
            logger.debug("===>>> id = " + loginVO.getId());
            logger.debug("jwtToken validated");
            logger.debug("===>>> loginVO.getUserSe() = "+loginVO.getUserSe());

            String role = isAdmin(loginVO) ? "ROLE_ADMIN" : "ROLE_USER";

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    loginVO, null, Arrays.asList(new SimpleGrantedAuthority(role))
            );

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            logger.debug("authentication ===>>> " + authentication);
        } catch (InvalidJwtException e) {
            logger.debug(e.getMessage());
            // 토큰이 없거나 유효하지 않아도 필터 체인을 계속 진행
            // Spring Security의 permitAll()이 처리하도록 함
        }

        chain.doFilter(req, res);
    }

    private boolean isAdmin(LoginVO loginVO) {
        return "ROLE_ADMIN".equals(loginVO.getGroupNm());
    }
    
    /**
     * 인증이 필요 없는 경로인지 확인
     */
    private boolean shouldSkipAuthentication(String requestPath) {
        // 인증이 필요 없는 경로 목록
        String[] skipPaths = {
            "/",
            "/auth/login-jwt",
            "/auth/login",
            "/login",
            "/v3/api-docs",
            "/swagger-ui",
            "/swagger-resources",
            "/webjars",
            "/file",
            "/etc",
            "/cmmnCompany/stplat",
            "/cmmnCompany/join",
            "/cmmnCompany/checkDuplicate",
            "/cmmnCompany/codeOption"
        };
        
        for (String skipPath : skipPaths) {
            if (requestPath.equals(skipPath) || requestPath.startsWith(skipPath + "/")) {
                return true;
            }
        }
        return false;
    }
}
