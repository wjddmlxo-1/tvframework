package tvframework.com.cmm.dataaccess.util;

import java.util.HashMap;

/**
 * EgovMap 대체 클래스
 * org.egovframe.rte.psl.dataaccess.util.EgovMap을 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@SuppressWarnings("serial")
public class EgovMap extends HashMap<String, Object> {
    
   /**
     * 기본 생성자
     */
    public EgovMap() {
        super();
    }
    
    /**
     * 초기 용량을 지정하는 생성자
     * 
     * @param initialCapacity 초기 용량
     */
    public EgovMap(int initialCapacity) {
        super(initialCapacity);
    }
    
    /**
     * 초기 용량과 로드 팩터를 지정하는 생성자
     * 
     * @param initialCapacity 초기 용량
     * @param loadFactor 로드 팩터
     */
    public EgovMap(int initialCapacity, float loadFactor) {
        super(initialCapacity, loadFactor);
    }
    
    /**
     * 다른 Map을 복사하는 생성자
     * 
     * @param m 복사할 Map
     */
    public EgovMap(java.util.Map<? extends String, ? extends Object> m) {
        super(m);
    }
}





