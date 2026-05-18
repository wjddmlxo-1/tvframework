package tvframework.man.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsUserPostSaveDTO {
    /** 수정 시 게시글 번호(미지정 시 신규 등록) */
    private String nttSq;
    private String cmpnyCd;
    private String bbsId;
    private String categorySq;
    private String title;
    private String contents;
    private String noticeAt;
    /** 게시글 상태(PUBLIC/SECRET) */
    private String nttSttus;
    private String ntceBgnde;
    private String ntceEndde;
    /** 게시글 답변 대상 게시글번호(없으면 일반글) */
    private String parentNttSq;
    /** 업로드된 첨부 FILE_SQ 목록(등록 후 게시글에 바인딩). 앨범형 게시판은 이미지 1개 이상 필수 */
    private List<String> fileSqs;
}
