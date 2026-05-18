package tvframework.com.cmm.idgnr.strategy;

/**
 * ID 생성 전략 인터페이스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface IdGnrStrategy {
    
   /**
     * 다음 ID를 생성한다.
     * 
     * @param originalId 원본 ID
     * @return 생성된 ID
     */
    String makeId(String originalId);
}

