-- MySQL dump 10.13  Distrib 9.7.1, for macos26.6 (arm64)
--
-- Host: localhost    Database: museumschema
-- ------------------------------------------------------
-- Server version	9.7.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'c9a9b26c-9d96-11f1-aabc-d8ee23e40c8e:1-110';

--
-- Table structure for table `artist`
--

DROP TABLE IF EXISTS `artist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artist` (
  `ArtistID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `BirthYear` date NOT NULL,
  `DeathYear` date DEFAULT NULL,
  `Nationality` varchar(255) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ArtistID`),
  KEY `fk_artist_createdby` (`CreatedBy`),
  CONSTRAINT `fk_artist_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_artist_dates` CHECK ((`DeathYear` >= `BirthYear`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artist`
--

LOCK TABLES `artist` WRITE;
/*!40000 ALTER TABLE `artist` DISABLE KEYS */;
/*!40000 ALTER TABLE `artist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artwork`
--

DROP TABLE IF EXISTS `artwork`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artwork` (
  `CollectionID` bigint unsigned NOT NULL,
  `ArtworkID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Title` varchar(255) NOT NULL,
  `Type` varchar(255) NOT NULL,
  `DateCreated` date NOT NULL COMMENT 'year',
  `ArtistID` bigint unsigned NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ArtworkID`),
  KEY `fk_artwork_collection` (`CollectionID`),
  KEY `fk_artwork_artist` (`ArtistID`),
  KEY `fk_artwork_createdby` (`CreatedBy`),
  CONSTRAINT `fk_artwork_artist` FOREIGN KEY (`ArtistID`) REFERENCES `artist` (`ArtistID`),
  CONSTRAINT `fk_artwork_collection` FOREIGN KEY (`CollectionID`) REFERENCES `collection` (`CollectionID`),
  CONSTRAINT `fk_artwork_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artwork`
--

LOCK TABLES `artwork` WRITE;
/*!40000 ALTER TABLE `artwork` DISABLE KEYS */;
/*!40000 ALTER TABLE `artwork` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artworkexhibition`
--

DROP TABLE IF EXISTS `artworkexhibition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artworkexhibition` (
  `ArtworkID` bigint unsigned NOT NULL,
  `ExhibitionID` bigint unsigned NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`ArtworkID`,`ExhibitionID`),
  KEY `fk_artworkexhibition_createdby` (`CreatedBy`),
  KEY `fk_artworkexhibition_exhibition` (`ExhibitionID`),
  CONSTRAINT `fk_artworkexhibition_artwork` FOREIGN KEY (`ArtworkID`) REFERENCES `artwork` (`ArtworkID`),
  CONSTRAINT `fk_artworkexhibition_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_artworkexhibition_exhibition` FOREIGN KEY (`ExhibitionID`) REFERENCES `exhibition` (`ExhibitionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artworkexhibition`
--

LOCK TABLES `artworkexhibition` WRITE;
/*!40000 ALTER TABLE `artworkexhibition` DISABLE KEYS */;
/*!40000 ALTER TABLE `artworkexhibition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cafe`
--

DROP TABLE IF EXISTS `cafe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cafe` (
  `ItemID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ItemName` varchar(255) NOT NULL,
  `Category` varchar(255) NOT NULL,
  `StaffID` bigint unsigned NOT NULL,
  `Price` decimal(8,2) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ItemID`),
  KEY `fk_cafe_staff` (`StaffID`),
  KEY `fk_cafe_createdby` (`CreatedBy`),
  CONSTRAINT `fk_cafe_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_cafe_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_cafe_price` CHECK ((`Price` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cafe`
--

LOCK TABLES `cafe` WRITE;
/*!40000 ALTER TABLE `cafe` DISABLE KEYS */;
/*!40000 ALTER TABLE `cafe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cafesale`
--

DROP TABLE IF EXISTS `cafesale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cafesale` (
  `SaleID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ItemID` bigint unsigned NOT NULL,
  `SalePrice` decimal(8,2) NOT NULL,
  `Quantity` int NOT NULL,
  `StaffID` bigint unsigned NOT NULL,
  `SaleDate` date NOT NULL,
  `PaymentMethod` varchar(255) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `MembershipID` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`SaleID`),
  KEY `fk_cafesale_item` (`ItemID`),
  KEY `fk_cafesale_staff` (`StaffID`),
  KEY `fk_cafesale_createdby` (`CreatedBy`),
  KEY `fk_cafesale_membership` (`MembershipID`),
  CONSTRAINT `fk_cafesale_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_cafesale_item` FOREIGN KEY (`ItemID`) REFERENCES `cafe` (`ItemID`),
  CONSTRAINT `fk_cafesale_membership` FOREIGN KEY (`MembershipID`) REFERENCES `membership` (`MembershipID`),
  CONSTRAINT `fk_cafesale_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_cafesale_payment` CHECK ((`PaymentMethod` in (_utf8mb4'Cash',_utf8mb4'Credit Card',_utf8mb4'Debit Card',_utf8mb4'Mobile Pay'))),
  CONSTRAINT `chk_cafesale_price` CHECK ((`SalePrice` > 0)),
  CONSTRAINT `chk_cafesale_quantity` CHECK ((`Quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cafesale`
--

LOCK TABLES `cafesale` WRITE;
/*!40000 ALTER TABLE `cafesale` DISABLE KEYS */;
/*!40000 ALTER TABLE `cafesale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collection`
--

DROP TABLE IF EXISTS `collection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection` (
  `CollectionID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Description` varchar(255) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`CollectionID`),
  KEY `fk_collection_createdby` (`CreatedBy`),
  CONSTRAINT `fk_collection_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection`
--

LOCK TABLES `collection` WRITE;
/*!40000 ALTER TABLE `collection` DISABLE KEYS */;
/*!40000 ALTER TABLE `collection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donations` (
  `DonationID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `PaymentMethod` varchar(255) NOT NULL,
  `AmountDonated` decimal(8,2) NOT NULL,
  `DonationDate` date NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`DonationID`),
  KEY `fk_donations_createdby` (`CreatedBy`),
  CONSTRAINT `fk_donations_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_donations_amount` CHECK ((`AmountDonated` > 0)),
  CONSTRAINT `chk_donations_payment` CHECK ((`PaymentMethod` in (_utf8mb4'Cash',_utf8mb4'Credit Card',_utf8mb4'Debit Card',_utf8mb4'Check',_utf8mb4'Bank Transfer')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
/*!40000 ALTER TABLE `donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exhibition`
--

DROP TABLE IF EXISTS `exhibition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exhibition` (
  `ExhibitionID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Description` varchar(255) NOT NULL,
  `Capacity` int NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ExhibitionID`),
  KEY `fk_exhibition_createdby` (`CreatedBy`),
  CONSTRAINT `fk_exhibition_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_exhibition_capacity` CHECK (((`Capacity` > 0) and (`Capacity` <= 1400))),
  CONSTRAINT `chk_exhibition_dates` CHECK ((`StartDate` < `EndDate`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exhibition`
--

LOCK TABLES `exhibition` WRITE;
/*!40000 ALTER TABLE `exhibition` DISABLE KEYS */;
/*!40000 ALTER TABLE `exhibition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exhibitionstaff`
--

DROP TABLE IF EXISTS `exhibitionstaff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exhibitionstaff` (
  `ExhibitionID` bigint unsigned NOT NULL,
  `StaffID` bigint unsigned NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`ExhibitionID`,`StaffID`),
  KEY `fk_exhibitionstaff_staff` (`StaffID`),
  KEY `fk_exhibitionstaff_createdby` (`CreatedBy`),
  CONSTRAINT `fk_exhibitionstaff_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_exhibitionstaff_exhibition` FOREIGN KEY (`ExhibitionID`) REFERENCES `exhibition` (`ExhibitionID`),
  CONSTRAINT `fk_exhibitionstaff_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exhibitionstaff`
--

LOCK TABLES `exhibitionstaff` WRITE;
/*!40000 ALTER TABLE `exhibitionstaff` DISABLE KEYS */;
/*!40000 ALTER TABLE `exhibitionstaff` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_exhibitionstaff_min_one` BEFORE DELETE ON `exhibitionstaff` FOR EACH ROW BEGIN
    IF (SELECT COUNT(*) FROM exhibitionstaff WHERE ExhibitionID = OLD.ExhibitionID) <= 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Exhibition must have at least one staff member';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `giftshop`
--

DROP TABLE IF EXISTS `giftshop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giftshop` (
  `ItemID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ItemName` varchar(255) NOT NULL,
  `Category` varchar(255) NOT NULL,
  `StaffID` bigint unsigned NOT NULL,
  `Price` decimal(8,2) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `Stock` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ItemID`),
  KEY `fk_giftshop_staff` (`StaffID`),
  KEY `fk_giftshop_createdby` (`CreatedBy`),
  CONSTRAINT `fk_giftshop_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_giftshop_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_giftshop_price` CHECK ((`Price` > 0)),
  CONSTRAINT `chk_giftshop_stock` CHECK ((`Stock` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giftshop`
--

LOCK TABLES `giftshop` WRITE;
/*!40000 ALTER TABLE `giftshop` DISABLE KEYS */;
/*!40000 ALTER TABLE `giftshop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `giftshopsale`
--

DROP TABLE IF EXISTS `giftshopsale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giftshopsale` (
  `SaleID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ItemID` bigint unsigned NOT NULL,
  `SalePrice` decimal(8,2) NOT NULL,
  `Quantity` int NOT NULL,
  `StaffID` bigint unsigned NOT NULL,
  `SaleDate` date NOT NULL,
  `PaymentMethod` varchar(255) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `MembershipID` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`SaleID`),
  KEY `fk_giftshopsale_item` (`ItemID`),
  KEY `fk_giftshopsale_staff` (`StaffID`),
  KEY `fk_giftshopsale_createdby` (`CreatedBy`),
  KEY `fk_giftshopsale_membership` (`MembershipID`),
  CONSTRAINT `fk_giftshopsale_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_giftshopsale_item` FOREIGN KEY (`ItemID`) REFERENCES `giftshop` (`ItemID`),
  CONSTRAINT `fk_giftshopsale_membership` FOREIGN KEY (`MembershipID`) REFERENCES `membership` (`MembershipID`),
  CONSTRAINT `fk_giftshopsale_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_giftshopsale_payment` CHECK ((`PaymentMethod` in (_utf8mb4'Cash',_utf8mb4'Credit Card',_utf8mb4'Debit Card',_utf8mb4'Mobile Pay'))),
  CONSTRAINT `chk_giftshopsale_price` CHECK ((`SalePrice` > 0)),
  CONSTRAINT `chk_giftshopsale_quantity` CHECK ((`Quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giftshopsale`
--

LOCK TABLES `giftshopsale` WRITE;
/*!40000 ALTER TABLE `giftshopsale` DISABLE KEYS */;
/*!40000 ALTER TABLE `giftshopsale` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_giftshopsale_stock_check` BEFORE INSERT ON `giftshopsale` FOR EACH ROW BEGIN
    IF NEW.Quantity > (SELECT Stock FROM giftshop WHERE ItemID = NEW.ItemID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Not enough stock for this sale';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_giftshopsale_stock_decrement` AFTER INSERT ON `giftshopsale` FOR EACH ROW BEGIN
    UPDATE giftshop SET Stock = Stock - NEW.Quantity WHERE ItemID = NEW.ItemID;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `membership`
--

DROP TABLE IF EXISTS `membership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membership` (
  `MembershipID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `MembershipType` varchar(255) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Price` decimal(8,2) NOT NULL,
  `PaymentMethod` varchar(255) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `DiscountPercent` decimal(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`MembershipID`),
  KEY `fk_membership_createdby` (`CreatedBy`),
  CONSTRAINT `fk_membership_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_membership_dates` CHECK ((`StartDate` < `EndDate`)),
  CONSTRAINT `chk_membership_discount` CHECK ((`DiscountPercent` between 0 and 100)),
  CONSTRAINT `chk_membership_payment` CHECK ((`PaymentMethod` in (_utf8mb4'Cash',_utf8mb4'Credit Card',_utf8mb4'Debit Card',_utf8mb4'Bank Transfer'))),
  CONSTRAINT `chk_membership_price` CHECK ((`Price` > 0)),
  CONSTRAINT `chk_membership_type` CHECK ((`MembershipType` in (_utf8mb4'Individual',_utf8mb4'Family',_utf8mb4'Student',_utf8mb4'Senior')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership`
--

LOCK TABLES `membership` WRITE;
/*!40000 ALTER TABLE `membership` DISABLE KEYS */;
/*!40000 ALTER TABLE `membership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `StaffID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `Role` varchar(255) NOT NULL,
  `Department` varchar(255) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date DEFAULT NULL,
  `Email` varchar(255) NOT NULL,
  `PhoneNumber` varchar(255) NOT NULL,
  `Street` varchar(255) DEFAULT NULL,
  `City` varchar(255) DEFAULT NULL,
  `State` varchar(255) DEFAULT NULL,
  `ZipCode` varchar(255) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`StaffID`),
  KEY `fk_staff_createdby` (`CreatedBy`),
  CONSTRAINT `fk_staff_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_staff_role` CHECK ((`Role` in (_utf8mb4'Admin',_utf8mb4'Curator',_utf8mb4'Exhibition Manager',_utf8mb4'Gift Shop',_utf8mb4'Ticket Desk',_utf8mb4'Cafe')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffcredentials`
--

DROP TABLE IF EXISTS `staffcredentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffcredentials` (
  `StaffID` bigint unsigned NOT NULL,
  `Username` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `MFAEnabled` tinyint(1) NOT NULL DEFAULT '0',
  `MFAMethod` varchar(255) DEFAULT NULL,
  `MFAContact` varchar(255) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  PRIMARY KEY (`StaffID`),
  UNIQUE KEY `uq_staffcredentials_username` (`Username`),
  CONSTRAINT `fk_staffcredentials_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_staffcredentials_mfa_method` CHECK (((`MFAMethod` is null) or (`MFAMethod` in (_utf8mb4'Email',_utf8mb4'SMS',_utf8mb4'Authenticator App'))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffcredentials`
--

LOCK TABLES `staffcredentials` WRITE;
/*!40000 ALTER TABLE `staffcredentials` DISABLE KEYS */;
/*!40000 ALTER TABLE `staffcredentials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `TicketID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `TicketType` varchar(255) NOT NULL,
  `Price` decimal(8,2) NOT NULL,
  `SaleDate` date NOT NULL,
  `ExhibitionID` bigint unsigned NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `MembershipID` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`TicketID`),
  KEY `fk_ticket_exhibition` (`ExhibitionID`),
  KEY `fk_ticket_createdby` (`CreatedBy`),
  KEY `fk_ticket_membership` (`MembershipID`),
  CONSTRAINT `fk_ticket_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_ticket_exhibition` FOREIGN KEY (`ExhibitionID`) REFERENCES `exhibition` (`ExhibitionID`),
  CONSTRAINT `fk_ticket_membership` FOREIGN KEY (`MembershipID`) REFERENCES `membership` (`MembershipID`),
  CONSTRAINT `chk_ticket_price` CHECK ((`Price` > 0)),
  CONSTRAINT `chk_ticket_type` CHECK ((`TicketType` in (_utf8mb4'Adult',_utf8mb4'Senior',_utf8mb4'Student',_utf8mb4'Child',_utf8mb4'Member')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ticket_capacity_insert` BEFORE INSERT ON `ticket` FOR EACH ROW BEGIN
    IF (SELECT COUNT(*) FROM ticket WHERE ExhibitionID = NEW.ExhibitionID) >=
       (SELECT Capacity FROM exhibition WHERE ExhibitionID = NEW.ExhibitionID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Exhibition ticket capacity exceeded';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_member_ticket_check` BEFORE INSERT ON `ticket` FOR EACH ROW BEGIN
    IF NEW.TicketType = 'Member' AND (
        NEW.MembershipID IS NULL OR
        NOT EXISTS (
            SELECT 1 FROM membership
            WHERE MembershipID = NEW.MembershipID
              AND IsDeleted = FALSE
              AND NEW.SaleDate BETWEEN StartDate AND EndDate
        )
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Member ticket requires a valid, active membership';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ticket_capacity_update` BEFORE UPDATE ON `ticket` FOR EACH ROW BEGIN
    IF NEW.ExhibitionID <> OLD.ExhibitionID AND
       (SELECT COUNT(*) FROM ticket WHERE ExhibitionID = NEW.ExhibitionID) >=
       (SELECT Capacity FROM exhibition WHERE ExhibitionID = NEW.ExhibitionID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Exhibition ticket capacity exceeded';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_member_ticket_check_update` BEFORE UPDATE ON `ticket` FOR EACH ROW BEGIN
    IF NEW.TicketType = 'Member' AND NOT EXISTS (SELECT 1 FROM membership WHERE MembershipID = NEW.MembershipID AND IsDeleted = FALSE AND NEW.SaleDate BETWEEN StartDate AND EndDate) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Member ticket requires a valid, active membership';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping routines for database 'museumschema'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-29  0:19:57
