package tvframework.com.cmm.web;

/*
 * Copyright 2001-2006 The Apache Software Foundation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import jakarta.servlet.ServletContext;

import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import lombok.extern.slf4j.Slf4j;

/**
 * 경량환경 파일업로드 처리를 위한 기능 클래스
 *
 * @author 공통서비스개발팀 이삼섭
 * @since 2009.06.01
 * @version 1.0
 * @see
 *
 *      <pre>
 * << 개정이력(Modification Information) >>
 *
 *  수정일               수정자            수정내용
 *  ----------   --------    ---------------------------
 *  2009.03.25   이삼섭             최초 생성
 *  2011.06.11   정진오             스프링3.0 업그레이드API변경으로인한 수정
 *  2020.10.27   이용준             예외처리 수정
 *  2020.10.29   이용준             사용자가 설정한 확장자만 업로드하도록 (globals.properties > Globals.fileUpload.Extensions)
 *
 *      </pre>
 */
@Slf4j
public class MultipartResolver extends StandardServletMultipartResolver {

	public MultipartResolver() {
		super();
	}

	/**
	 * 첨부파일 처리를 위한 multipart resolver를 생성한다.
	 *
	 * @param servletContext
	 */
	public MultipartResolver(ServletContext servletContext) {
		super();
	}

	// Spring Boot 3.0에서는 CommonsMultipartResolver가 제거되어 
	// StandardServletMultipartResolver를 사용해야 합니다.
	// 커스텀 파일 업로드 로직은 다른 방식으로 구현해야 합니다.
	// TODO: 파일 확장자 검증 로직을 다른 방식으로 구현 필요
}
