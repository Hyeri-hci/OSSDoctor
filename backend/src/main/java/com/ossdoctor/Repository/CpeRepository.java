package com.ossdoctor.Repository;

import com.ossdoctor.Entity.CpeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface CpeRepository extends JpaRepository<CpeEntity,Long> {
    List<CpeEntity> findByVendorAndProductAndVersion(String vendor, String product, String version);
    List<CpeEntity> findByVendorAndProduct(String vendor, String product);
    List<CpeEntity> findByProductAndVersion(String product, String version);
    List<CpeEntity> findByProduct(String Product);
}
