package tvframework.com.cmm.idgnr;

/**
 * ID ?�성 ?�비???�터?�이??
 * EgovIdGnrService�??�체하???�터?�이??
 * 
 * @author 공통 개발?�
 * @since 2025.01.01
 * @version 1.0
 */
public interface IdGnrService {
    
    /**
     * ?�음 String ID�?반환?�다.
     * 
     * @return ?�음 String ID
     * @throws Exception
     */
    String getNextStringId() throws Exception;
    
    /**
     * ?�음 Long ID�?반환?�다.
     * 
     * @return ?�음 Long ID
     * @throws Exception
     */
    long getNextLongId() throws Exception;
}

