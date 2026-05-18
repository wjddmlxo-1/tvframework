package tvframework.com.cmm.web;

import java.util.Base64;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;

import tvframework.com.cmm.crypto.CryptoService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import tvframework.com.cmm.service.FileMngService;
import tvframework.com.cmm.service.FileVO;
import tvframework.com.cmm.service.ResultVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * ?�일 조회, ??��, ?�운로드 처리�??�한 컨트롤러 ?�래??
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
 *   2009.03.25  ?�삼??         최초 ?�성
 *   2011.08.31  JJY            경량?�경 ?�플�?커스?�마?�징버전 ?�성
 *
 * </pre>
 */
@RestController
@Tag(name="FileMngApiController",description = "파일 관리")
public class FileMngApiController {

    @Resource(name = "FileMngService")
    private FileMngService fileService;

	/** ?�호?�서비스 */
    @Resource(name="egovARIACryptoService")
    CryptoService cryptoService;

    /**
     * 첨�??�일???�????���?처리?�다.
     *
     * @param atchFileId
     * @param fileSn
     * @return resultVO
     * @throws Exception
     */
    @Operation(
			summary = "?�일 ??��",
			description = "첨�??�일???�????���?처리",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"FileMngApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "?�공")
	})
    @PostMapping(value ="/file")
    public ResultVO deleteFileInf(HttpServletRequest request, @RequestBody FileVO fileVO) throws Exception {
    	ResultVO resultVO = new ResultVO();
    	
    	// ?�호?�된 atchFileId �?복호??(2022.12.06 추�?) - ?�일?�이?��? ?�추 불�??�하?�록 조치
    	String atchFileId = fileVO.getAtchFileId().replaceAll(" ", "+");
    	byte[] decodedBytes = Base64.getDecoder().decode(atchFileId);
    	String decodedFileId = new String(cryptoService.decrypt(decodedBytes,FileDownloadController.ALGORITM_KEY));
    			
    	fileVO.setAtchFileId(decodedFileId);

		//Boolean isAuthenticated = UserDetailsHelper.isAuthenticated();

		fileService.deleteFileInf(fileVO);

		resultVO.setResultCode(200);
		resultVO.setResultMessage("??�� ?�공");


		//--------------------------------------------
		// contextRoot가 ?�는 경우 ?�외 ?�켜????
		//--------------------------------------------
		////return "forward:/cmm/fms/selectFileInfs.do";
		//return "forward:" + returnUrl;

		return resultVO;
    }
}
