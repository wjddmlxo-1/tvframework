package tvframework.com.cmm.orm.ibatis.support;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.support.lob.LobCreator;
import org.springframework.jdbc.support.lob.LobHandler;

/**
 * LOB TypeHandler 기본 클래스
 * EgovFrame의 AbstractLobTypeHandler를 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public abstract class AbstractLobTypeHandler {
    
    private LobHandler lobHandler;
    
    /**
     * 기본 생성자
     */
    public AbstractLobTypeHandler() {
        // 기본 생성자
    }
    
    /**
     * LobHandler를 설정하는 생성자
     * 
     * @param lobHandler LobHandler
     */
    protected AbstractLobTypeHandler(LobHandler lobHandler) {
        this.lobHandler = lobHandler;
    }
    
    /**
     * LobHandler를 설정한다.
     * 
     * @param lobHandler LobHandler
     */
    public void setLobHandler(LobHandler lobHandler) {
        this.lobHandler = lobHandler;
    }
    
    /**
     * LobHandler를 반환한다.
     * 
     * @return LobHandler
     */
    protected LobHandler getLobHandler() {
        return lobHandler;
    }
    
    /**
     * 파라미터를 설정한다.
     * 
     * @param ps PreparedStatement
     * @param index 인덱스
     * @param value 값
     * @param jdbcType JDBC 타입
     * @param lobCreator LobCreator
     * @throws SQLException
     */
    protected abstract void setParameterInternal(
        PreparedStatement ps, int index, Object value, String jdbcType, LobCreator lobCreator)
        throws SQLException;
    
    /**
     * 결과를 가져온다.
     * 
     * @param rs ResultSet
     * @param index 인덱스
     * @param lobHandler LobHandler
     * @return 결과 객체
     * @throws SQLException
     */
    protected abstract Object getResultInternal(ResultSet rs, int index, LobHandler lobHandler)
        throws SQLException;
    
    /**
     * 문자열을 값으로 변환한다.
     * 
     * @param s 문자열
     * @return 값 객체
     */
    public abstract Object valueOf(String s);
}

