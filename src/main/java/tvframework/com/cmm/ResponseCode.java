package tvframework.com.cmm;

public enum ResponseCode {

	SUCCESS(200, "성공하였습니다."),
	AUTH_ERROR(403, "권한이 없습니다."),
	DELETE_ERROR(700, "삭제 시 오류가 발생하였습니다."),
	SAVE_ERROR(800, "저장 시 오류가 발생하였습니다."),
	INPUT_CHECK_ERROR(900, "입력값 무결성 오류 입니다.");

	private int code;
	private String message;

	private ResponseCode(int code, String message) {
		this.code = code;
		this.message = message;
	}

	public int getCode() {
		return code;
	}

	public String getMessage() {
		return message;
	}

}
