package tvframework.com.cmm.web;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletResponse;

import tvframework.com.cmm.crypto.CryptoService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import tvframework.com.cmm.WebUtil;
import tvframework.com.cmm.SessionVO;
import tvframework.com.cmm.service.FileMngService;
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
 * @Class Name : ImageProcessController.java
 * @Description :
 * @Modification Information
 *
 *    ?�정??      ?�정??        ?�정?�용
 *    -------        -------     -------------------
 *    2009. 4. 2.     ?�삼??
 *    2011.08.31.     JJY        경량?�경 ?�플�?커스?�마?�징버전 ?�성
 *
 * @author 공통 ?�비??개발?� ?�삼??
 * @since 2009. 4. 2.
 * @version
 * @see
 *
 */
@Slf4j
@Controller
@Tag(name="ImageProcessController",description = "?��?지 처리")
public class ImageProcessController extends HttpServlet {

	/**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = -6339945210971171173L;

	@Resource(name = "FileMngService")
	private FileMngService fileService;
	
	/** ?�호?�서비스 */
    @Resource(name="egovARIACryptoService")
    CryptoService cryptoService;

	/**
	 * 첨�????��?지???�??미리보기 기능???�공?�다.
	 *
	 * @param atchFileId
	 * @param fileSn
	 * @param sessionVO
	 * @param model
	 * @param response
	 * @throws Exception
	 */
    @Operation(
			summary = "?��?지 미리보기",
			description = "첨�????��?지???�??미리보기 기능???�공",
			tags = {"ImageProcessController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "?�공")
	})
    @GetMapping("/image")
	public void getImageInf(
			@Parameter(hidden = true)SessionVO sessionVO, 
			ModelMap model, 
			@Parameter(
					in = ParameterIn.QUERY,
					schema = @Schema(type = "object",
							additionalProperties = Schema.AdditionalPropertiesValue.TRUE, 
							ref = "#/components/schemas/fileMap"),
					style = ParameterStyle.FORM,
					explode = Explode.TRUE
			) @RequestParam Map<String, Object> commandMap,
		HttpServletResponse response) throws Exception {

		// ?�호?�된 atchFileId �?복호?? (2022.12.06 추�?) - ?�일?�이?��? ?�추 불�??�하?�록 조치
		String param_atchFileId = (String) commandMap.get("atchFileId");
		param_atchFileId = param_atchFileId.replaceAll(" ", "+");
		byte[] decodedBytes = Base64.getDecoder().decode(param_atchFileId);
		String decodedFileId = new String(cryptoService.decrypt(decodedBytes,FileDownloadController.ALGORITM_KEY));
		String fileSn = (String) commandMap.get("fileSn");

		FileVO vo = new FileVO();

		vo.setAtchFileId(decodedFileId);
		vo.setFileSn(fileSn);

		FileVO fvo = fileService.selectFileInf(vo);

		//String fileLoaction = fvo.getFileStreCours() + fvo.getStreFileNm();
		String fileStreCours = WebUtil.filePathBlackList(fvo.getFileStreCours());
		String streFileNm = WebUtil.filePathBlackList(fvo.getStreFileNm());

		File file = new File(fileStreCours, streFileNm);
		
		// Try-with-resources�??�용???�원 ?�제 처리 (try 구문???�언??리소?��? ?�동 반납)
		// try???�달?????�는 ?�원?� java.lang.AutoCloseable ?�터?�이?�의 구현 객체�??�정
		try (FileInputStream fis = new FileInputStream(file);
		     BufferedInputStream in = new BufferedInputStream(fis);
		     ByteArrayOutputStream bStream = new ByteArrayOutputStream();) {
			
			int imgByte;
			while ((imgByte = in.read()) != -1) {
				bStream.write(imgByte);
			}

			String type = "";

			if (fvo.getFileExtsn() != null && !"".equals(fvo.getFileExtsn())) {
				if ("jpg".equals(fvo.getFileExtsn().toLowerCase())) {
					type = "image/jpeg";
				} else {
					type = "image/" + fvo.getFileExtsn().toLowerCase();
				}
				type = "image/" + fvo.getFileExtsn().toLowerCase();

			} else {
				log.debug("Image fileType is null.");
			}

			response.setHeader("Content-Type", type);
			response.setContentLength(bStream.size());

			bStream.writeTo(response.getOutputStream());

			response.getOutputStream().flush();
			response.getOutputStream().close();

		} catch (IOException e) {
			log.debug("{}", e);
		}
	}
}
