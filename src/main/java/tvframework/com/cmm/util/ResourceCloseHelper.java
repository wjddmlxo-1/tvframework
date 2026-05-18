package tvframework.com.cmm.util;

import java.io.Closeable;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Wrapper;

/**
 * Utility class  to support to close resources
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
public class ResourceCloseHelper {
	/**
	 * Resource close 처리.
	 * @param resources
	 */
	public static void close(Closeable  ... resources) {
		for (Closeable resource : resources) {
			if (resource != null) {
				try {
					resource.close();
				} catch (IOException ignore) {//KISA 보안?�점 조치 (2018-10-29, ?�창??
					BasicLogger.ignore("Occurred IOException to close resource is ignored!!");
				}
			}
		}
	}
	
	/**
	 * JDBC 관??resource 객체 close 처리
	 * @param objects
	 */
	public static void closeDBObjects(Wrapper ... objects) {
		for (Object object : objects) {
			if (object != null) {
				if (object instanceof ResultSet) {
					try {
						((ResultSet)object).close();
					} catch (SQLException ignore) {//KISA 보안?�점 조치 (2018-10-29, ?�창??
						BasicLogger.ignore("Occurred SQLException to close resource is ignored!!");
					}
				} else if (object instanceof Statement) {
					try {
						((Statement)object).close();
					} catch (SQLException ignore) {//KISA 보안?�점 조치 (2018-10-29, ?�창??
						BasicLogger.ignore("Occurred SQLException to close resource is ignored!!");
					}
				} else if (object instanceof Connection) {
					try {
						((Connection)object).close();
					} catch (SQLException ignore) {
						BasicLogger.ignore("Occurred SQLException to close resource is ignored!!");
					}
				} else {
					throw new IllegalArgumentException("Wrapper type is not found : " + object.toString());
				}
			}
		}
	}
	
	/**
	 * Socket 관??resource 객체 close 처리
	 * @param objects
	 */
	public static void closeSocketObjects(Socket socket, ServerSocket server) {
		if (socket != null) {
			try {
				socket.shutdownOutput();
			} catch (IOException ignore) {
				BasicLogger.ignore("Occurred IOException to close resource is ignored!!");
			}
			
			try {
				socket.close();
			} catch (IOException ignore) {
				BasicLogger.ignore("Occurred IOException to close resource is ignored!!");
			}
		}
		
		if (server != null) {
			try {
				server.close();
			} catch (IOException ignore) {
				BasicLogger.ignore("Occurred IOException to close resource is ignored!!");
			}
		}
	}
	
	/**
	 *  Socket 관??resource 객체 close 처리
	 *  
	 * @param sockets
	 */
	public static void closeSockets(Socket ... sockets) {
		for (Socket socket : sockets) {
			if (socket != null) {
				try {
					socket.shutdownOutput();
				} catch (IOException ignore) {
					BasicLogger.ignore("Occurred IOException to close resource is ignored!!");
				}
				
				try {
					socket.close();
				} catch (IOException ignore) {
					BasicLogger.ignore("Occurred IOException to close resource is ignored!!");
				}
			}
		}
	}
}