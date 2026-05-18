package tvframework.com.cmm.web;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.Base64;
import java.util.Map;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import tvframework.com.cmm.exception.BizException;
import tvframework.com.cmm.crypto.CryptoService;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import tvframework.com.cmm.WebUtil;
import tvframework.com.cmm.service.FileMngService;
import tvframework.com.cmm.service.AppProperties;
import tvframework.com.cmm.service.FileVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.Explode;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.enums.ParameterStyle;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

/**
 * ?�일 ?�운로드�??�한 컨트롤러 ?�래??
 * @author 공통?�비?�개발�? ?�삼??
 * @since 2009.06.01
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *
 *   ?�정??     ?�정??          ?�정?�용
 *  -------    --------    ---------------------------
 *   2009.3.25  ?�삼??         최초 ?�성
 *
 * Copyright (C) 2009 by MOPAS  All right reserved.
 * </pre>
 */
@Slf4j
@Controller
@Tag(name="FileDownloadController",description = "?�일 ?�운로드")
public class FileDownloadController {

	@Resource(name = "FileMngService")
	private FileMngService fileService;
	
	/** ?�호?�서비스 */
    @Resource(name="egovARIACryptoService")
    CryptoService cryptoService;
	
	public static final String ALGORITM_KEY = AppProperties.getProperty("Globals.crypto.algoritm");

	/**
	 * 브라?��? 구분 ?�기.
	 *
	 * @param request
	 * @return
	 */
	private String getBrowser(HttpServletRequest request) {
		String header = request.getHeader("User-Agent");
		if (header.indexOf("MSIE") > -1) {
			return "MSIE";
		} else if (header.indexOf("Trident") > -1) { // IE11 문자??깨짐 방�?
			return "Trident";
		} else if (header.indexOf("Chrome") > -1) {
			return "Chrome";
		} else if (header.indexOf("Opera") > -1) {
			return "Opera";
		}
		return "Firefox";
	}

	/**
	 * Disposition 지?�하�?
	 *
	 * @param filename
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	private void setDisposition(String filename, HttpServletRequest request, HttpServletResponse response)
		throws Exception {
		String browser = getBrowser(request);

		String dispositionPrefix = "attachment; filename=";
		String encodedFilename = null;

		if (browser.equals("MSIE")) {
			encodedFilename = URLEncoder.encode(filename, "UTF-8").replaceAll("\\+", "%20");
		} else if (browser.equals("Trident")) { // IE11 문자??깨짐 방�?
			encodedFilename = URLEncoder.encode(filename, "UTF-8").replaceAll("\\+", "%20");
		} else if (browser.equals("Firefox")) {
			encodedFilename = "\"" + new String(filename.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.equals("Opera")) {
			encodedFilename = "\"" + new String(filename.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.equals("Chrome")) {
			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < filename.length(); i++) {
				char c = filename.charAt(i);
				if (c > '~') {
					sb.append(URLEncoder.encode("" + c, "UTF-8"));
				} else {
					sb.append(c);
				}
			}
			encodedFilename = sb.toString();
		} else {
			//throw new RuntimeException("Not supported browser");
			throw new IOException("Not supported browser");
		}

		response.setHeader("Content-Disposition", dispositionPrefix + encodedFilename);

		if ("Opera".equals(browser)) {
			response.setContentType("application/octet-stream;charset=UTF-8");
		}
	}

	/**
	 * 첨�??�일�??�록???�일???�?�여 ?�운로드�??�공?�다.
	 *
	 * @param commandMap
	 * @param response
	 * @throws Exception
	 */
	
	@Operation(
			summary = "?�일 ?�운로드",
			description = "첨�??�일�??�록???�일???�?�여 ?�운로드�??�공",
			tags = {"FileDownloadController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "?�공")
	})
	@GetMapping(value = "/file")
	public void cvplFileDownload(
			@Parameter(
					in = ParameterIn.QUERY,
					schema = @Schema(type = "object",
							additionalProperties = Schema.AdditionalPropertiesValue.TRUE, 
							ref = "#/components/schemas/fileMap"),
					style = ParameterStyle.FORM,
					explode = Explode.TRUE
			) @RequestParam Map<String, Object> commandMap, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {

			// ?�호?�된 atchFileId �?복호??(2022.12.06 추�?) - ?�일?�이?��? ?�추 불�??�하?�록 조치
			String param_atchFileId = (String) commandMap.get("atchFileId");
			param_atchFileId = param_atchFileId.replaceAll(" ", "+");
			byte[] decodedBytes = Base64.getDecoder().decode(param_atchFileId);
			String decodedFileId = new String(cryptoService.decrypt(decodedBytes,ALGORITM_KEY));
			String fileSn = (String) commandMap.get("fileSn");
			
			FileVO fileVO = new FileVO();
			fileVO.setAtchFileId(decodedFileId);
			fileVO.setFileSn(fileSn);
			FileVO fvo = fileService.selectFileInf(fileVO);

			String fileStreCours = WebUtil.filePathBlackList(fvo.getFileStreCours());
			String streFileNm = WebUtil.filePathBlackList(fvo.getStreFileNm());

			File uFile = new File(fileStreCours, streFileNm);
			long fSize = uFile.length();

			if (fSize > 0) {
				//String mimetype = "application/x-msdownload";
				String mimetype = "application/x-stuff";

				//response.setBufferSize(fSize);	// OutOfMemeory 발생
				response.setContentType(mimetype);
				//response.setHeader("Content-Disposition", "attachment; filename=\"" + URLEncoder.encode(fvo.getOrignlFileNm(), "utf-8") + "\"");
				setDisposition(fvo.getOrignlFileNm(), request, response);
				//response.setContentLength(fSize);

				/*
				 * FileCopyUtils.copy(in, response.getOutputStream());
				 * in.close();
				 * response.getOutputStream().flush();
				 * response.getOutputStream().close();
				 */
				
				// Try-with-resources�??�용???�원 ?�제 처리 (try 구문???�언??리소?��? ?�동 반납)
				// try???�달?????�는 ?�원?� java.lang.AutoCloseable ?�터?�이?�의 구현 객체�??�정
				try (BufferedInputStream in = new BufferedInputStream(new FileInputStream(uFile));
				     BufferedOutputStream out = new BufferedOutputStream(response.getOutputStream());){
				        FileCopyUtils.copy(in, out);
					out.flush();
				} catch (FileNotFoundException ex) {
					log.debug("IGNORED: {}", ex.getMessage());
				}

			} else {
				throw new BizException("?�일??찾을 ???�습?�다.");
			}
		}
}
