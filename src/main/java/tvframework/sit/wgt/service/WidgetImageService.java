package tvframework.sit.wgt.service;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import tvframework.sit.wgt.dto.CmFileBinaryDTO;

/**
 * 위젯 사진(CM_FILE, FILE_TY=WIDGET, SAVE_TY=DATA) 업로드/조회
 */
public interface WidgetImageService {

    /**
     * 이미지 바이너리를 CM_FILE에 저장하고 FILE_SQ(숫자) 및 표시용 FILE-채번 문자열을 반환한다.
     */
    Map<String, String> saveWidgetImageData(MultipartFile file, String userId) throws Exception;

    CmFileBinaryDTO loadWidgetImage(String fileSq) throws Exception;
}
