USE phpmyadmin;
ALTER TABLE `pma__column_info`
  MODIFY COLUMN `input_transformation` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '';
ALTER TABLE `pma__column_info`
  MODIFY COLUMN `input_transformation_options` VARCHAR(256) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '';
