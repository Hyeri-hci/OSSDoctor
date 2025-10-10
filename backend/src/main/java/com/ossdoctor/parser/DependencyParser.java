/*package com.ossdoctor.parser;

import com.ossdoctor.DTO.CpeDTO;
import java.util.List;

public interface DependencyParser {
    List<CpeDTO> parseDependencies(String fileContent);
    boolean supports(String fileName);
}
 */
package com.ossdoctor.parser;

import com.ossdoctor.DTO.CpeDTO;
import java.util.List;

public interface DependencyParser {
    List<CpeDTO> parseDependencies(String fileContent);
    boolean supports(String fileName);
}
