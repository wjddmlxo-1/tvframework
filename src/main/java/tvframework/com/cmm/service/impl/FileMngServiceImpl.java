package tvframework.com.cmm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.annotation.Resource;

import org.springframework.stereotype.Service;

import tvframework.com.cmm.service.FileMngService;
import tvframework.com.cmm.service.FileVO;

import tvframework.com.cmm.service.AbstractServiceImpl;

/**
 * @Class Name : FileMngServiceImpl.java
 * @Description : ?�일?�보??관리�? ?�한 구현 ?�래??
 * @Modification Information
 *
 *    ?�정??      ?�정??        ?�정?�용
 *    -------        -------     -------------------
 *    2009. 3. 25.     ?�삼??   최초?�성
 *
 * @author 공통 ?�비??개발?� ?�삼??
 * @since 2009. 3. 25.
 * @version
 * @see
 *
 */
@Service("FileMngService")
public class FileMngServiceImpl extends AbstractServiceImpl implements FileMngService {

    @Resource(name = "FileManageDAO")
    private FileManageDAO fileMngDAO;

    /**
     * ?�러 개의 ?�일????��?�다.
     *
     * @see egovframework.com.cmm.service.FileMngService#deleteFileInfs(java.util.List)
     */
    @Override
    public void deleteFileInfs(List<?> fvoList) throws Exception {
	fileMngDAO.deleteFileInfs(fvoList);
    }

    /**
     * ?�나???�일???�???�보(?�성 �??�세)�??�록?�다.
     *
     * @see egovframework.com.cmm.service.FileMngService#insertFileInf(egovframework.com.cmm.service.FileVO)
     */
    @Override
	public String insertFileInf(FileVO fvo) throws Exception {
	String atchFileId = fvo.getAtchFileId();

	fileMngDAO.insertFileInf(fvo);

	return atchFileId;
    }

    /**
     * ?�러 개의 ?�일???�???�보(?�성 �??�세)�??�록?�다.
     *
     * @see egovframework.com.cmm.service.FileMngService#insertFileInfs(java.util.List)
     */
    @Override
    public String insertFileInfs(List<?> fvoList) throws Exception {
	String atchFileId = "";

	if (fvoList.size() != 0) {
	    atchFileId = fileMngDAO.insertFileInfs(fvoList);
	}
	if("".equals(atchFileId)){
		atchFileId = null;
	}
	return atchFileId;
    }

    /**
     * ?�일???�??목록??조회?�다.
     *
     * @see egovframework.com.cmm.service.FileMngService#selectFileInfs(egovframework.com.cmm.service.FileVO)
     */
    @Override
	public List<FileVO> selectFileInfs(FileVO fvo) throws Exception {
	return fileMngDAO.selectFileInfs(fvo);
    }

    /**
     * ?�러 개의 ?�일???�???�보(?�성 �??�세)�??�정?�다.
     *
     * @see egovframework.com.cmm.service.FileMngService#updateFileInfs(java.util.List)
     */
    @Override
	public void updateFileInfs(List<?> fvoList) throws Exception {
	//Delete & Insert
	fileMngDAO.updateFileInfs(fvoList);
    }

    /**
     * ?�나???�일????��?�다.
     *
     * @see egovframework.com.cmm.service.FileMngService#deleteFileInf(egovframework.com.cmm.service.FileVO)
     */
    @Override
	public void deleteFileInf(FileVO fvo) throws Exception {
	fileMngDAO.deleteFileInf(fvo);
    }

    /**
     * ?�일???�???�세?�보�?조회?�다.
     *
     * @see egovframework.com.cmm.service.FileMngService#selectFileInf(egovframework.com.cmm.service.FileVO)
     */
    @Override
	public FileVO selectFileInf(FileVO fvo) throws Exception {
	return fileMngDAO.selectFileInf(fvo);
    }

    /**
     * ?�일 구분?�에 ?�??최�?값을 구한??
     *
     * @see egovframework.com.cmm.service.FileMngService#getMaxFileSN(egovframework.com.cmm.service.FileVO)
     */
    @Override
	public int getMaxFileSN(FileVO fvo) throws Exception {
	return fileMngDAO.getMaxFileSN(fvo);
    }

    /**
     * ?�체 ?�일????��?�다.
     *
     * @see egovframework.com.cmm.service.FileMngService#deleteAllFileInf(egovframework.com.cmm.service.FileVO)
     */
    @Override
	public void deleteAllFileInf(FileVO fvo) throws Exception {
	fileMngDAO.deleteAllFileInf(fvo);
    }

    /**
     * ?�일�?검?�에 ?�??목록??조회?�다.
     *
     * @see egovframework.com.cmm.service.FileMngService#selectFileListByFileNm(egovframework.com.cmm.service.FileVO)
     */
    @Override
	public Map<String, Object> selectFileListByFileNm(FileVO fvo) throws Exception {
	List<FileVO>  result = fileMngDAO.selectFileListByFileNm(fvo);
	int cnt = fileMngDAO.selectFileListCntByFileNm(fvo);

	Map<String, Object> map = new HashMap<String, Object>();

	map.put("resultList", result);
	map.put("resultCnt", Integer.toString(cnt));

	return map;
    }

    /**
     * ?��?지 ?�일???�??목록??조회?�다.
     *
     * @see egovframework.com.cmm.service.FileMngService#selectImageFileList(egovframework.com.cmm.service.FileVO)
     */
    @Override
	public List<FileVO> selectImageFileList(FileVO vo) throws Exception {
	return fileMngDAO.selectImageFileList(vo);
    }
}
