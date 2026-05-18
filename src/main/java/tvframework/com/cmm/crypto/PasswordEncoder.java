package tvframework.com.cmm.crypto;

/**
 * 비밀번호 인코더
 * EgovPasswordEncoder를 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public class PasswordEncoder {
    
    private String algorithm = "SHA-256";
    private String hashedPassword;
    
    /**
     * 알고리즘을 설정한다.
     * 
     * @param algorithm 알고리즘
     */
    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }
    
    /**
     * 해시된 비밀번호를 설정한다.
     * 
     * @param hashedPassword 해시된 비밀번호
     */
    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }
    
    /**
     * 알고리즘을 반환한다.
     * 
     * @return 알고리즘
     */
    public String getAlgorithm() {
        return algorithm;
    }
    
    /**
     * 해시된 비밀번호를 반환한다.
     * 
     * @return 해시된 비밀번호
     */
    public String getHashedPassword() {
        return hashedPassword;
    }
}