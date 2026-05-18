package tvframework.sit.wgt.service.impl;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import tvframework.com.cmm.idgnr.impl.TableIdGnrServiceImpl;
import tvframework.sit.wgt.dto.CmFileBinaryDTO;
import tvframework.sit.wgt.service.WidgetImageService;

/**
 * CM_IDS(FILE_SQ) + CM_FILE 공통 저장. {@link FileMngService}는 구 스키마(첨부마스터)용이므로 CM_FILE 직접 Mapper 사용.
 */
@Service
public class WidgetImageServiceImpl implements WidgetImageService {

    private static final int FILE_EXT_MAX = 10;
    private static final int FILE_NM_MAX = 255;
    private static final long MAX_BYTES = 10 * 1024 * 1024L;

    private final TableIdGnrServiceImpl cmFileSqIdGnrService;
    private final WidgetMapper widgetMapper;

    public WidgetImageServiceImpl(
        @Qualifier("cmFileSqIdGnrService") TableIdGnrServiceImpl cmFileSqIdGnrService,
        WidgetMapper widgetMapper
    ) {
        this.cmFileSqIdGnrService = cmFileSqIdGnrService;
        this.widgetMapper = widgetMapper;
    }

    @Override
    public Map<String, String> saveWidgetImageData(MultipartFile file, String userId) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다.");
        }
        String orig = file.getOriginalFilename();
        if (!StringUtils.hasText(orig)) {
            orig = "image";
        }
        if (orig.length() > FILE_NM_MAX) {
            orig = orig.substring(0, FILE_NM_MAX);
        }
        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }
        byte[] data = file.getBytes();
        if (data.length == 0) {
            throw new IllegalArgumentException("파일 내용이 없습니다.");
        }
        if (data.length > MAX_BYTES) {
            throw new IllegalArgumentException("파일 크기는 10MB 이하여야 합니다.");
        }

        long seq = cmFileSqIdGnrService.getNextLongId();
        String fileSqStr = String.valueOf(seq);
        String display = "FILE-" + String.format("%05d", seq);

        String ext = "";
        int dot = orig.lastIndexOf('.');
        if (dot >= 0 && dot < orig.length() - 1) {
            ext = orig.substring(dot + 1).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        }
        if (ext.length() > FILE_EXT_MAX) {
            ext = ext.substring(0, FILE_EXT_MAX);
        }

        String uid = StringUtils.hasText(userId) ? userId.trim() : null;

        Map<String, Object> p = new HashMap<>();
        p.put("fileSq", fileSqStr);
        p.put("fileNm", orig);
        p.put("mimeTy", contentType);
        p.put("fileExt", StringUtils.hasText(ext) ? ext : null);
        p.put("fileData", data);
        p.put("fileSize", (long) data.length);
        p.put("creationId", uid);
        p.put("updateId", uid);

        widgetMapper.insertCmFileWidgetData(p);

        Map<String, String> out = new HashMap<>();
        out.put("fileSq", fileSqStr);
        out.put("fileSqDisplay", display);
        return out;
    }

    @Override
    public CmFileBinaryDTO loadWidgetImage(String fileSq) throws Exception {
        if (!StringUtils.hasText(fileSq)) {
            return null;
        }
        Map<String, Object> q = new HashMap<>();
        q.put("fileSq", fileSq.trim());
        return widgetMapper.selectCmFileWidgetData(q);
    }
}
