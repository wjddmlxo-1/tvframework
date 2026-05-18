package tvframework.com.cmm.service.impl;

import java.util.Iterator;
import java.util.List;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.com.cmm.service.FileVO;

/**
 * @Class Name : EgovFileMngDAO.java
 * @Description : ?�일?�보 관리�? ?�한 ?�이??처리 ?�래??
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
@Repository("FileManageDAO")
public class FileManageDAO extends AbstractMapper {

	/**
	 * ?�러 개의 ?�일???�???�보(?�성 �??�세)�??�록?�다.
	 *
	 * @param fileList
	 * @return
	 * @throws Exception
	 */
	public String insertFileInfs(List<?> fileList) throws Exception {
		FileVO vo = (FileVO) fileList.get(0);
		String atchFileId = vo.getAtchFileId();

		insert("FileManageDAO.insertFileMaster", vo);

		Iterator<?> iter = fileList.iterator();
		while (iter.hasNext()) {
			vo = (FileVO) iter.next();

			insert("FileManageDAO.insertFileDetail", vo);
		}

		return atchFileId;
	}

	/**
	 * ?�나???�일???�???�보(?�성 �??�세)�??�록?�다.
	 *
	 * @param vo
	 * @throws Exception
	 */
	public void insertFileInf(FileVO vo) throws Exception {
		insert("FileManageDAO.insertFileMaster", vo);
		insert("FileManageDAO.insertFileDetail", vo);
	}

	/**
	 * ?�러 개의 ?�일???�???�보(?�성 �??�세)�??�정?�다.
	 *
	 * @param fileList
	 * @throws Exception
	 */
	public void updateFileInfs(List<?> fileList) throws Exception {
		FileVO vo;
		Iterator<?> iter = fileList.iterator();
		while (iter.hasNext()) {
			vo = (FileVO) iter.next();

			insert("FileManageDAO.insertFileDetail", vo);
		}
	}

	/**
	 * ?�러 개의 ?�일????��?�다.
	 *
	 * @param fileList
	 * @throws Exception
	 */
	public void deleteFileInfs(List<?> fileList) throws Exception {
		Iterator<?> iter = fileList.iterator();
		FileVO vo;
		while (iter.hasNext()) {
			vo = (FileVO) iter.next();

			delete("FileManageDAO.deleteFileDetail", vo);
		}
	}

	/**
	 * ?�나???�일????��?�다.
	 *
	 * @param fvo
	 * @throws Exception
	 */
	public void deleteFileInf(FileVO fvo) throws Exception {
		delete("FileManageDAO.deleteFileDetail", fvo);
	}

	/**
	 * ?�일???�??목록??조회?�다.
	 *
	 * @param vo
	 * @return
	 * @throws Exception
	 */
	public List<FileVO> selectFileInfs(FileVO vo) throws Exception {
		return selectList("FileManageDAO.selectFileList", vo);
	}

	/**
	 * ?�일 구분?�에 ?�??최�?값을 구한??
	 *
	 * @param fvo
	 * @return
	 * @throws Exception
	 */
	public int getMaxFileSN(FileVO fvo) throws Exception {
		return (Integer) selectOne("FileManageDAO.getMaxFileSN", fvo);
	}

	/**
	 * ?�일???�???�세?�보�?조회?�다.
	 *
	 * @param fvo
	 * @return
	 * @throws Exception
	 */
	public FileVO selectFileInf(FileVO fvo) throws Exception {
		return (FileVO) selectOne("FileManageDAO.selectFileInf", fvo);
	}

	/**
	 * ?�체 ?�일????��?�다.
	 *
	 * @param fvo
	 * @throws Exception
	 */
	public void deleteAllFileInf(FileVO fvo) throws Exception {
		update("FileManageDAO.deleteCOMTNFILE", fvo);
	}

	/**
	 * ?�일�?검?�에 ?�??목록??조회?�다.
	 *
	 * @param vo
	 * @return
	 * @throws Exception
	 */
	public List<FileVO> selectFileListByFileNm(FileVO fvo) throws Exception {
		return selectList("FileManageDAO.selectFileListByFileNm", fvo);
	}

	/**
	 * ?�일�?검?�에 ?�??목록 ?�체 건수�?조회?�다.
	 *
	 * @param fvo
	 * @return
	 * @throws Exception
	 */
	public int selectFileListCntByFileNm(FileVO fvo) throws Exception {
		return (Integer) selectOne("FileManageDAO.selectFileListCntByFileNm", fvo);
	}

	/**
	 * ?��?지 ?�일???�??목록??조회?�다.
	 *
	 * @param vo
	 * @return
	 * @throws Exception
	 */
	public List<FileVO> selectImageFileList(FileVO vo) throws Exception {
		return selectList("FileManageDAO.selectImageFileList", vo);
	}
}
