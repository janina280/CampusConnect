package chat.campusconnectserver.utils;


import com.nimbusds.oauth2.sdk.util.StringUtils;
import lombok.extern.slf4j.Slf4j;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
@Slf4j
public class FileUtils {

    private FileUtils() {}

    public static byte[] readFileFromLocation(String fileUrl) {
        if (StringUtils.isBlank(fileUrl)) {
            return new byte[0];
        }
        try {
            Path filePath = new File(fileUrl).toPath();
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.warn("Nou file found in the path {}", fileUrl);
        }
        return new byte[0];
    }
}