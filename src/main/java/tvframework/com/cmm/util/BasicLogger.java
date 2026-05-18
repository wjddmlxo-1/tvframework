package tvframework.com.cmm.util;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Utility class  to support to logging information
 * @author Vincent Han
 * @since 2014.09.18
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *   
 *   ?�정??       ?�정??      ?�정?�용
 *  -------       --------    ---------------------------
 *   2014.09.18	?��??�레?�워?�센??최초 ?�성
 *
 * </pre>
 */
public class BasicLogger {
	private static final Level IGNORE_INFO_LEVEL = Level.OFF;
	private static final Level DEBUG_INFO_LEVEL = Level.FINEST;
	private static final Level INFO_INFO_LEVEL = Level.INFO;
	
	private static final Logger ignoreLogger = Logger.getLogger("ignore");
	private static final Logger debugLogger = Logger.getLogger("debug");
	private static final Logger infoLogger = Logger.getLogger("info");
	
	/**
	 * 기록?�나 처리가 불필?�한 경우 ?�용.
	 * @param message
	 * @param exception
	 */
	public static void ignore(String message, Exception exception) {
		if (exception == null) {
			ignoreLogger.log(IGNORE_INFO_LEVEL, message);
		} else {
			ignoreLogger.log(IGNORE_INFO_LEVEL, message, exception);
		}
	}
	
	/**
	 * 기록?�나 처리가 불필?�한 경우 ?�용.
	 * @param message
	 * @param exception
	 */
	public static void ignore(String message) {
		ignore(message, null);
	}
	
	/**
	 * ?�버�??�보�?기록?�는 경우 ?�용.
	 * @param message
	 * @param exception
	 */
	public static void debug(String message, Exception exception) {
		if (exception == null) {
			debugLogger.log(DEBUG_INFO_LEVEL, message);
		} else {
			debugLogger.log(DEBUG_INFO_LEVEL, message, exception);
		}
	}
	
	/**
	 * ?�버�??�보�?기록?�는 경우 ?�용.
	 * @param message
	 * @param exception
	 */
	public static void debug(String message) {
		debug(message, null);
	}

	/**
	 * ?�반?�인 ?�보�?기록?�는 경우 ?�용.
	 * @param message
	 * @param exception
	 */
	public static void info(String message) {
		infoLogger.log(INFO_INFO_LEVEL, message);
	}
}
