package tvframework.com.cmm.dataaccess;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

/**
 * MyBatis Mapper 기본 클래스
 * EgovAbstractMapper를 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public abstract class AbstractMapper {
    
    @Autowired
    @Qualifier("egovSqlSessionTemplate")
    protected SqlSession sqlSession;
    
    /**
     * 리스트 조회 (파라미터 없음)
     * 
     * @param statement SQL statement ID
     * @return 조회 결과 리스트
     */
    @SuppressWarnings("unchecked")
    protected <E> List<E> selectList(String statement) {
        return sqlSession.selectList(statement);
    }
    
    /**
     * 리스트 조회 (파라미터 있음)
     * 
     * @param statement SQL statement ID
     * @param parameter 조회 파라미터
     * @return 조회 결과 리스트
     */
    @SuppressWarnings("unchecked")
    protected <E> List<E> selectList(String statement, Object parameter) {
        return sqlSession.selectList(statement, parameter);
    }
    
    /**
     * 단건 조회 (파라미터 없음)
     * 
     * @param statement SQL statement ID
     * @return 조회 결과
     */
    protected <T> T selectOne(String statement) {
        return sqlSession.selectOne(statement);
    }
    
    /**
     * 단건 조회 (파라미터 있음)
     * 
     * @param statement SQL statement ID
     * @param parameter 조회 파라미터
     * @return 조회 결과
     */
    protected <T> T selectOne(String statement, Object parameter) {
        return sqlSession.selectOne(statement, parameter);
    }
    
    /**
     * 데이터 등록 (파라미터 없음)
     * 
     * @param statement SQL statement ID
     * @return 등록된 행 수
     */
    protected int insert(String statement) {
        return sqlSession.insert(statement);
    }
    
    /**
     * 데이터 등록 (파라미터 있음)
     * 
     * @param statement SQL statement ID
     * @param parameter 등록 파라미터
     * @return 등록된 행 수
     */
    protected int insert(String statement, Object parameter) {
        return sqlSession.insert(statement, parameter);
    }
    
    /**
     * 데이터 수정 (파라미터 없음)
     * 
     * @param statement SQL statement ID
     * @return 수정된 행 수
     */
    protected int update(String statement) {
        return sqlSession.update(statement);
    }
    
    /**
     * 데이터 수정 (파라미터 있음)
     * 
     * @param statement SQL statement ID
     * @param parameter 수정 파라미터
     * @return 수정된 행 수
     */
    protected int update(String statement, Object parameter) {
        return sqlSession.update(statement, parameter);
    }
    
    /**
     * 데이터 삭제 (파라미터 없음)
     * 
     * @param statement SQL statement ID
     * @return 삭제된 행 수
     */
    protected int delete(String statement) {
        return sqlSession.delete(statement);
    }

    /**
     * 데이터 삭제 (파라미터 있음)
     * 
     * @param statement SQL statement ID
     * @param parameter 삭제 파라미터
     * @return 삭제된 행 수
     */
    protected int delete(String statement, Object parameter) {
        return sqlSession.delete(statement, parameter);
    }
}