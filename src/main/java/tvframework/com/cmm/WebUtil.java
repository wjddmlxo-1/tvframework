package tvframework.com.cmm;

import tvframework.com.cmm.service.ResultVO;

import java.io.File;
import java.util.regex.Pattern;

/**
 * 교차?�속 ?�크립트 공격 취약??방�?(?�라미터 문자??교체)
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *
 *  ?�정??        ?�정??     ?�정?�용
 *  ----------   --------   ---------------------------
 *  2011.10.10   ?�성�?      최초 ?�성
 *	2017-02-07   ?�정?�       ?�큐?�코??ES) - ?�큐?�코??경로 조작 �??�원 ?�입[CWE-22, CWE-23, CWE-95, CWE-99]
 *  2018.08.17   ?�용??      filePathBlackList ?�정
 *  2018.10.10   ?�용??      . => \\.?�로 ?�정
 *  2024.12.04   ?�용??      filePathBlackList() basePath ?�라미터 추�?
 * </pre>
 */

public class WebUtil {


	public static ResultVO handleAuthError(int code, String msg) {
		ResultVO resultVO = new ResultVO();
		resultVO.setResultCode(code);
		resultVO.setResultMessage(msg);
		return resultVO;
	}
	public static String clearXSSMinimum(String value) {
		if (value == null || value.trim().equals("")) {
			return "";
		}

		String returnValue = value;

		returnValue = returnValue.replaceAll("&", "&amp;");
		returnValue = returnValue.replaceAll("<", "&lt;");
		returnValue = returnValue.replaceAll(">", "&gt;");
		returnValue = returnValue.replaceAll("\"", "&#34;");
		returnValue = returnValue.replaceAll("\'", "&#39;");
		returnValue = returnValue.replaceAll("\\.", "&#46;");
		returnValue = returnValue.replaceAll("%2E", "&#46;");
		returnValue = returnValue.replaceAll("%2F", "&#47;");
		return returnValue;
	}

	public static String clearXSSMaximum(String value) {
		String returnValue = value;
		returnValue = clearXSSMinimum(returnValue);

		returnValue = returnValue.replaceAll("%00", null);

		returnValue = returnValue.replaceAll("%", "&#37;");

		// \\. => .

		returnValue = returnValue.replaceAll("\\.\\./", ""); // ../
		returnValue = returnValue.replaceAll("\\.\\.\\\\", ""); // ..\
		returnValue = returnValue.replaceAll("\\./", ""); // ./
		returnValue = returnValue.replaceAll("%2F", "");

		return returnValue;
	}

	public static String filePathBlackList(String value) {
		String returnValue = value;
		if (returnValue == null || returnValue.trim().equals("")) {
			return "";
		}

		returnValue = returnValue.replaceAll("\\.\\.", "");

		return returnValue;
	}
	
	/**
	 * ?�일경로 보안취약??조치
	 * # 주의?�항
	 * 1. basePath??반드??지?�해???�다.
	 * 2. basePath??ROOT Path "/" ?�용 금�? ?�다.
	 * 3. basePath ?�위 ?�렉?�리???�로?�한 ?�일??존재?�도�?구성?�며 중요?�일??존재?��? ?�도�?관리한??
	 *
	 * @param value ?�일�?
	 * @param basePath 기본 경로
	 * @return
	 */
	public static String filePathBlackList(String value, String basePath) {
		if ( basePath == null || "".equals(basePath) )
			throw new SecurityException("base path is empty.");
		if ( File.separator.equals(basePath) || "/".equals(basePath) )
			throw new SecurityException("base path does not allow Root.");
		return filePathBlackList(basePath + value);
	}

	/**
	 * ?�안부 보안취약???��? 조치 방안.
	 *
	 * @param value
	 * @return
	 */
	public static String filePathReplaceAll(String value) {
		String returnValue = value;
		if (returnValue == null || returnValue.trim().equals("")) {
			return "";
		}

		returnValue = returnValue.replaceAll("/", "");
		returnValue = returnValue.replaceAll("\\\\", ""); // \
		returnValue = returnValue.replaceAll("\\.\\.", ""); // ..
		returnValue = returnValue.replaceAll("&", "");

		return returnValue;
	}
	
	public static String fileInjectPathReplaceAll(String value) {
		String returnValue = value;
		if (returnValue == null || returnValue.trim().equals("")) {
			return "";
		}

		
		returnValue = returnValue.replaceAll("/", "");
		returnValue = returnValue.replaceAll("\\..", ""); // ..
		returnValue = returnValue.replaceAll("\\\\", "");// \
		returnValue = returnValue.replaceAll("&", "");

		return returnValue;
	}

	public static String filePathWhiteList(String value) {
		return value;
	}

	public static boolean isIPAddress(String str) {
		Pattern ipPattern = Pattern.compile("\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}");

		return ipPattern.matcher(str).matches();
    }

	public static String removeCRLF(String parameter) {
		return parameter.replaceAll("\r", "").replaceAll("\n", "");
	}

	public static String removeSQLInjectionRisk(String parameter) {
		return parameter.replaceAll("\\p{Space}", "").replaceAll("\\*", "").replaceAll("%", "").replaceAll(";", "").replaceAll("-", "").replaceAll("\\+", "").replaceAll(",", "");
	}

	public static String removeOSCmdRisk(String parameter) {
		return parameter.replaceAll("\\p{Space}", "").replaceAll("\\*", "").replaceAll("\\|", "").replaceAll(";", "");
	}

}