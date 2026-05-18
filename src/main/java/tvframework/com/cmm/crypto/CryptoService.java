package tvframework.com.cmm.crypto;

/**
 * 암호화 서비스 인터페이스
 * EgovCryptoService를 대체하는 인터페이스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface CryptoService {
    
    /**
     * 데이터를 암호화한다.
     * 
     * @param data 암호화할 데이터
     * @param key 암호화 키
     * @return 암호화된 데이터
     * @throws Exception
     */
    byte[] encrypt(byte[] data, String key) throws Exception;
    
    /**
     * 데이터를 복호화한다.
     * 
     * @param data 복호화할 데이터
     * @param key 복호화 키
     * @return 복호화된 데이터
     * @throws Exception
     */
    byte[] decrypt(byte[] data, String key) throws Exception;
}