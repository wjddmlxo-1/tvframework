package tvframework.com.jwt;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import tvframework.com.cmm.ResponseCode;
import tvframework.com.cmm.service.ResultVO;

/**
 * fileName       : JwtAuthenticationEntryPoint
 * author         : crlee
 * date           : 2023/06/11
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2023/06/11        crlee       최초 생성
 */

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {


    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        // permitAll() 경로에 대해서는 401을 반환하지 않음
        String requestPath = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && requestPath.startsWith(contextPath)) {
            requestPath = requestPath.substring(contextPath.length());
        }
        
        // 빈 문자열이거나 "/"인 경우도 처리
        if (requestPath == null || requestPath.isEmpty()) {
            requestPath = "/";
        }
        
        // 로그인 경로는 인증 실패 시에도 401을 반환하지 않음
        // permitAll()이 설정되어 있지만, 필터 체인에서 인증이 없으면 여기로 올 수 있음
        if (requestPath.equals("/auth/login-jwt") || requestPath.equals("/auth/login") || requestPath.startsWith("/auth/login")) {
            // 로그인 경로는 permitAll()로 설정되어 있어서 인증 실패가 발생하지 않아야 함
            // 하지만 혹시 모를 경우를 대비해 여기서는 200 OK를 반환하여 로그인 처리가 계속 진행되도록 함
            System.out.println("JwtAuthenticationEntryPoint: 로그인 경로 감지, 200 OK 반환: " + requestPath);
            // 로그인 경로는 인증이 필요 없으므로, 여기서는 200 OK를 반환하여 로그인 처리가 계속 진행되도록 함
            // 실제로는 이 EntryPoint가 호출되지 않아야 하지만, 호출되는 경우를 대비
            response.setStatus(HttpStatus.OK.value());
            response.setContentType(MediaType.APPLICATION_JSON.toString());
            response.setCharacterEncoding("UTF-8");
            // 빈 JSON 응답을 반환하여 필터 체인이 계속 진행되도록 함
            response.getWriter().write("{}");
            return;
        }
        
        System.out.println("JwtAuthenticationEntryPoint: 401 반환: " + requestPath);

        ResultVO resultVO = new ResultVO();
        resultVO.setResultCode(ResponseCode.AUTH_ERROR.getCode());
        resultVO.setResultMessage(ResponseCode.AUTH_ERROR.getMessage());
        ObjectMapper mapper = new ObjectMapper();

        //Convert object to JSON string
        String jsonInString = mapper.writeValueAsString(resultVO);

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON.toString());
        response.setCharacterEncoding("UTF-8");
        response.getWriter().println(jsonInString);

    }
}