package com.ossdoctor.Repository;

import com.ossdoctor.Entity.IssueEntity;
import com.ossdoctor.Entity.RepositoryEntity;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IssueRepository extends JpaRepository<IssueEntity, Long> {

}
