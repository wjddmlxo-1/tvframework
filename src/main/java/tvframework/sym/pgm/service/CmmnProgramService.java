package tvframework.sym.pgm.service;

import tvframework.sym.pgm.dto.CmmnProgramDTO;
import tvframework.sym.pgm.dto.CmmnProgramListResponseDTO;
import tvframework.sym.pgm.dto.CmmnProgramRequestDTO;

/**
 * 프로그램 관리 서비스 인터페이스
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface CmmnProgramService {

    /**
     * 프로그램 목록 조회 (페이징)
     *
     * @param searchKeyword 검색어 (프로그램명/URL/메시지내용)
     * @param cmpnyCd 회사코드 (메시지 조인·프로그램명 검색 시 사용)
     * @param langCode 언어코드 (메시지 조인·프로그램명 검색 시 사용, null이면 'ko' 사용)
     * @param pageIndex 페이지 번호
     * @param recordCountPerPage 페이지당 건수
     * @return 목록 및 페이징 정보
     */
    CmmnProgramListResponseDTO selectProgramList(String searchKeyword, String cmpnyCd, String langCode, Integer pageIndex, Integer recordCountPerPage) throws Exception;

    /**
     * 프로그램 상세 조회 (PK: cmpnyCd, progId). CM_MESSAGE_LANG 조인으로 프로그램명(messageCn) 조회.
     *
     * @param cmpnyCd 회사코드 (PK)
     * @param progId 프로그램 ID (PK)
     * @param langCode 언어코드 (메시지 조인용, null이면 'ko')
     * @return 프로그램 상세 (progrmNmCode=코드값, messageCn=표시명)
     */
    CmmnProgramDTO selectProgramDetail(String cmpnyCd, String progId, String langCode) throws Exception;

    /**
     * 프로그램 등록
     *
     * @param requestDTO 프로그램 정보
     */
    void insertProgram(CmmnProgramRequestDTO requestDTO) throws Exception;

    /**
     * 프로그램 수정
     *
     * @param requestDTO 프로그램 정보
     */
    void updateProgram(CmmnProgramRequestDTO requestDTO) throws Exception;

    /**
     * 프로그램 삭제 (PK: cmpnyCd, progId)
     *
     * @param cmpnyCd 회사코드 (PK)
     * @param progId 프로그램 ID (PK)
     */
    void deleteProgram(String cmpnyCd, String progId) throws Exception;
}
