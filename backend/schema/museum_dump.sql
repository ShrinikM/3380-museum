CREATE DATABASE  IF NOT EXISTS `museum` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `museum`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: team3museum.mysql.database.azure.com    Database: museum
-- ------------------------------------------------------
-- Server version	8.4.9-azure

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

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
  `BirthYear` smallint NOT NULL,
  `DeathYear` smallint DEFAULT NULL,
  `Nationality` varchar(255) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `UpdatedBy` bigint unsigned DEFAULT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ArtistID`),
  KEY `fk_artist_createdby` (`CreatedBy`),
  KEY `fk_artist_updatedby` (`UpdatedBy`),
  CONSTRAINT `fk_artist_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_artist_updatedby` FOREIGN KEY (`UpdatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_artist_dates` CHECK (((`DeathYear` is null) or (`DeathYear` >= `BirthYear`)))
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artist`
--

LOCK TABLES `artist` WRITE;
/*!40000 ALTER TABLE `artist` DISABLE KEYS */;
INSERT INTO `artist` VALUES (2,'Alex','Bondo',1991,2024,'American','2026-10-17 20:10:08','2026-11-05 21:34:50',4,4,0),(3,'Mango','Landp',2026,2026,'UK','2026-10-17 21:07:55','2026-11-10 20:41:15',4,4,1),(4,'Eleanor','Whitmore',1845,1912,'French','2026-10-21 08:39:01','2026-10-21 08:39:01',4,4,0),(5,'Dave','Moreau',1868,1935,'Argentinian','2026-10-21 08:39:01','2026-11-13 00:26:06',4,4,0),(6,'Clara','Bennett',1892,NULL,'American','2026-10-21 08:39:01','2026-10-21 08:39:01',4,4,0),(7,'Ding Go','da Vinci',1452,1519,'Italian','2026-10-22 21:10:29','2026-11-11 19:25:38',4,4,1),(8,'Vincent','van Gogh',1853,1890,'Dutch','2026-10-22 21:10:29','2026-10-25 21:06:02',4,4,1),(9,'Raphael','Sanzio',1483,1520,'Italian','2026-10-22 21:10:29','2026-10-25 21:06:02',4,4,1),(10,'Edgar','Degas',1834,1917,'French','2026-10-22 21:10:29','2026-11-11 23:10:29',4,4,1),(11,'Gustav','Klimt',1862,1918,'Austrian','2026-10-22 21:10:29','2026-10-22 21:10:29',4,4,0),(12,'Edvard','Munch',1863,1944,'Norwegian','2026-10-22 21:10:29','2026-10-25 21:06:02',4,4,1),(13,'Diego','Velázquez',1599,1660,'Spanish','2026-10-22 21:10:29','2026-10-25 21:06:02',4,4,1),(14,'Johannes','Vermeer',1632,1675,'Dutch','2026-10-22 21:10:29','2026-10-25 21:06:03',4,4,1),(15,'Élisabeth Louise','Vigée Le Brun',1755,1842,'French','2026-10-22 21:10:29','2026-10-25 21:06:03',4,4,1),(16,'Val','Kro',2005,NULL,'Rusiia','2026-10-26 20:07:24','2026-10-26 20:07:43',4,4,1),(17,'Staff','Test',1999,2018,'American','2026-10-26 22:24:58','2026-10-26 22:25:06',6,6,1),(18,'sdf','sdfsdf',6,13,'us','2026-11-02 18:21:03','2026-11-03 06:41:13',4,6,1),(19,'yufoyu','blhjb',1876,NULL,'Rusiia','2026-11-05 21:34:36','2026-11-05 21:35:03',4,4,1),(20,'asfasfsdasdf','eeeeee',1988,NULL,'American','2026-11-07 20:15:40','2026-11-07 20:18:31',4,4,1),(21,'Pablo','Picasso',1881,1973,'Spaniard','2026-11-07 21:09:23','2026-11-07 21:09:32',4,4,1),(22,'test','demo',1738,NULL,'Spaniard','2026-11-08 21:01:51','2026-11-08 21:02:05',4,4,1),(23,'Ben','ben',2005,NULL,'American','2026-11-10 20:01:58','2026-11-10 20:02:25',4,4,1),(24,'John','Smith',2000,NULL,'American','2026-11-10 20:40:25','2026-11-11 19:42:45',4,4,1),(25,'John','Smith',2000,NULL,'American','2026-11-11 19:43:00','2026-11-11 23:06:00',4,4,1),(26,'Dave','Ben',2000,NULL,'American','2026-11-11 23:05:11','2026-11-11 23:11:19',4,4,1),(27,'John','Smith',2000,NULL,'American','2026-11-11 23:11:10','2026-11-11 23:12:00',4,4,0),(28,'Valeriia','Krokhotina',4,NULL,'Serbia','2026-11-14 03:12:37','2026-11-14 03:13:06',4,4,1),(29,'Olga','Krokhotina',6,NULL,'Serbia','2026-11-14 03:13:00','2026-11-14 03:13:11',4,4,1);
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
  `YearCreated` smallint NOT NULL,
  `ArtistID` bigint unsigned NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `UpdatedBy` bigint unsigned DEFAULT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ArtworkID`),
  KEY `fk_artwork_collection` (`CollectionID`),
  KEY `fk_artwork_artist` (`ArtistID`),
  KEY `fk_artwork_createdby` (`CreatedBy`),
  KEY `fk_artwork_updatedby` (`UpdatedBy`),
  CONSTRAINT `fk_artwork_artist` FOREIGN KEY (`ArtistID`) REFERENCES `artist` (`ArtistID`),
  CONSTRAINT `fk_artwork_collection` FOREIGN KEY (`CollectionID`) REFERENCES `collection` (`CollectionID`),
  CONSTRAINT `fk_artwork_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_artwork_updatedby` FOREIGN KEY (`UpdatedBy`) REFERENCES `staff` (`StaffID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artwork`
--

LOCK TABLES `artwork` WRITE;
/*!40000 ALTER TABLE `artwork` DISABLE KEYS */;
INSERT INTO `artwork` VALUES (1,1,'Big DB','Painting',2022,2,'2026-10-17 20:16:05','2026-10-26 23:40:46',4,4,0),(1,2,'Garden in the Morning','Painting',1885,4,'2026-10-21 08:49:19','2026-10-24 23:13:09',4,4,0),(1,3,'Reflections at Dusk','Painting',1892,5,'2026-10-21 08:49:19','2026-10-24 23:13:59',4,4,0),(2,4,'Quiet Corners','Photography',1930,6,'2026-10-21 08:49:19','2026-10-24 23:13:31',4,4,0),(2,5,'Val','Sculpture',1900,6,'2026-10-26 23:41:14','2026-10-26 23:41:19',4,4,1),(2,6,'The Sea','Painting',1913,6,'2026-11-05 21:35:48','2026-11-14 05:18:36',4,4,0);
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
INSERT INTO `artworkexhibition` VALUES (1,1,'2026-10-18 19:51:05','2026-10-18 19:51:05',4),(2,1,'2026-10-21 08:53:36','2026-10-21 08:53:36',4),(2,2,'2026-10-21 08:53:36','2026-10-21 08:53:36',4),(3,2,'2026-10-21 08:53:36','2026-10-21 08:53:36',4),(4,4,'2026-10-21 08:53:36','2026-10-21 08:53:36',4);
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cafe`
--

LOCK TABLES `cafe` WRITE;
/*!40000 ALTER TABLE `cafe` DISABLE KEYS */;
INSERT INTO `cafe` VALUES (1,'Latte','Drinks',7,5.25,'2026-10-19 22:01:28','2026-10-19 22:01:28',4,0),(2,'Espresso','Drinks',7,3.75,'2026-10-19 22:01:28','2026-10-19 22:01:28',4,0),(3,'Croissant','Pastry',7,4.50,'2026-10-19 22:01:28','2026-10-19 22:01:28',4,0),(4,'Turkey Sandwich','Lunch',7,11.00,'2026-10-19 22:01:28','2026-10-19 22:01:28',4,0),(5,'Garden Salad','Lunch',7,10.50,'2026-10-19 22:01:28','2026-10-19 22:01:28',4,0),(6,'Chicken Sandwich','Sandwiches',4,32.00,'2026-10-26 22:57:40','2026-11-13 00:28:00',NULL,0),(7,'test','Salads',6,1.00,'2026-10-27 02:55:58','2026-10-27 02:56:02',NULL,1),(8,'Tart','Desserts',4,1.00,'2026-11-11 22:51:36','2026-11-13 00:27:49',NULL,0);
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cafesale`
--

LOCK TABLES `cafesale` WRITE;
/*!40000 ALTER TABLE `cafesale` DISABLE KEYS */;
INSERT INTO `cafesale` VALUES (1,1,5.25,3,7,'2026-07-12','Credit Card','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,NULL),(2,1,5.25,2,7,'2026-08-02','Mobile Pay','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,NULL),(3,1,5.25,4,6,'2026-09-06','Credit Card','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,2),(4,1,5.25,2,7,'2026-10-04','Debit Card','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,NULL),(5,2,3.75,2,7,'2026-07-19','Cash','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,NULL),(6,2,3.75,3,6,'2026-09-13','Mobile Pay','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,NULL),(7,3,4.50,4,7,'2026-08-16','Credit Card','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,NULL),(8,3,4.50,2,6,'2026-10-11','Cash','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,1),(9,4,11.00,2,7,'2026-08-23','Credit Card','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,1),(10,4,11.00,3,6,'2026-09-19','Debit Card','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,NULL),(11,4,11.00,1,7,'2026-10-15','Mobile Pay','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,NULL),(12,5,10.50,2,7,'2026-09-26','Credit Card','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,3),(13,5,10.50,1,6,'2026-10-03','Cash','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,NULL),(14,5,10.50,3,7,'2026-10-17','Debit Card','2026-10-19 22:01:29','2026-10-19 22:01:29',4,0,NULL);
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
  `UpdatedBy` bigint unsigned DEFAULT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`CollectionID`),
  KEY `fk_collection_createdby` (`CreatedBy`),
  KEY `fk_collection_updatedby` (`UpdatedBy`),
  CONSTRAINT `fk_collection_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_collection_updatedby` FOREIGN KEY (`UpdatedBy`) REFERENCES `staff` (`StaffID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection`
--

LOCK TABLES `collection` WRITE;
/*!40000 ALTER TABLE `collection` DISABLE KEYS */;
INSERT INTO `collection` VALUES (1,'Impressionism','Late 19th century French works','2026-10-17 19:52:52','2026-10-17 19:52:52',4,4,0),(2,'American Photography','Photographic works by American artists','2026-10-21 08:46:21','2026-10-21 08:46:21',4,4,0),(3,'Modern and Contemporary Art','Modern sculptures and contemporary artistic works','2026-10-21 08:46:21','2026-10-21 08:46:21',4,4,0);
/*!40000 ALTER TABLE `collection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `CustomerID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Phone` varchar(10) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `DateOfBirth` date DEFAULT NULL,
  `SchoolEmail` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CustomerID`),
  UNIQUE KEY `uq_customer_email` (`Email`),
  UNIQUE KEY `uq_customer_phone` (`Phone`),
  KEY `fk_customer_createdby` (`CreatedBy`),
  CONSTRAINT `fk_customer_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_customer_phone` CHECK (((`Phone` is null) or regexp_like(`Phone`,_utf8mb4'^[0-9]{10}$')))
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Maria','Lopez','maria.lopez@example.com',NULL,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL),(2,'James','Carter','james.carter@example.com',NULL,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL),(3,'Priya','Patel','priya.patel@example.com',NULL,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL),(4,'Robert','Nguyen','robert.nguyen@example.com',NULL,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL),(5,'Emily','Brooks','emily.brooks@example.com',NULL,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL),(6,'Daniel','Kim','daniel.kim@example.com',NULL,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL),(7,'Sofia','Garcia','sofia.garcia@example.com',NULL,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL),(8,'Henry','Wilson','henry.wilson@example.com',NULL,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL),(9,'Aisha','Rahman','aisha.rahman@example.com',NULL,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL),(10,'Tom','Becker','tom.becker@example.com',NULL,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL),(11,'Customer','Demo','customer@demo.test','7135550199','2026-10-23 15:28:37','2026-11-05 15:07:54',NULL,0,'1954-08-05','dave@cougarnet.uh.edu'),(16,'Nick','M','nickm@gmail.com',NULL,'2026-10-24 21:02:33','2026-10-24 21:02:33',NULL,0,NULL,NULL),(17,'Test','Student','student-test-missing@example.com','8325550141','2026-10-25 14:39:36','2026-10-25 14:39:36',NULL,0,NULL,'teststudent@cougarnet.uh.edu'),(18,'Test','Individual','individual-test@example.com','8325550145','2026-10-25 14:44:33','2026-10-25 14:44:33',NULL,0,NULL,NULL),(19,'Test','Senior','senior-over65@example.com','8325550147','2026-10-25 14:56:20','2026-10-25 16:42:00',NULL,0,'1960-01-01',NULL),(20,'Family','Test','family-test-001@example.com','8325550201','2026-10-25 15:08:24','2026-10-25 15:08:24',NULL,0,'1990-05-15',NULL),(21,'MaxFamily','Test','family-max-valid@example.com','8325550205','2026-10-25 15:12:21','2026-10-25 15:12:21',NULL,0,'1990-05-15',NULL),(22,'Dave','Johnson','davej@gmail.com','8326785487','2026-10-25 15:44:49','2026-10-25 15:44:49',NULL,0,'1999-10-19',NULL),(23,'Alex','IndividualTest','alex.individual.test@example.com','8325550199','2026-10-25 16:09:43','2026-10-25 16:50:48',NULL,0,NULL,NULL),(24,'Jamie','StudentTest','jamie.student.test@example.com','8325550102','2026-10-25 16:12:08','2026-10-25 16:12:08',NULL,0,'2005-01-15','jamie@cougarnet.uh.edu'),(25,'Taylor','SeniorTest','taylor.senior.test@example.com','8325550103','2026-10-25 16:14:57','2026-10-25 16:14:57',NULL,0,'1960-01-01',NULL),(26,'Morgan','FamilyTest','morgan.family.test@example.com','8325550198','2026-10-25 16:19:03','2026-10-25 16:52:04',NULL,0,'1990-01-01',NULL),(27,'jony','boy','jony@gmail.com','1235679956','2026-10-25 21:16:51','2026-10-25 21:16:51',NULL,0,NULL,NULL),(28,'ding dong','asdasd','shrinikm@gmail.com','3453453453','2026-10-26 15:43:01','2026-10-26 15:43:01',NULL,0,NULL,NULL),(29,'ding din','din','ding@gmail.com','2332423424','2026-10-26 19:23:13','2026-10-26 19:23:13',NULL,0,NULL,NULL),(30,'Valeriia','Krokhotina','vkrokhot@cougarnet.uh.edu','7138988314','2026-10-26 20:20:44','2026-11-04 17:13:22',NULL,0,NULL,NULL),(31,'testing','testinglast','testing@gmail.com','1234567890','2026-11-02 18:17:09','2026-11-02 18:17:09',NULL,0,NULL,NULL),(32,'customer2','demo2','customer2@demo.test','8326354879','2026-11-05 16:48:30','2026-11-05 16:48:30',NULL,0,NULL,NULL),(35,'Customer4','Demo','customer4cm@demo.test','5768546135','2026-11-05 20:50:27','2026-11-05 20:50:27',NULL,0,NULL,NULL),(36,'hhsvdjhv','bshdha','customerdemo@demo.test','5735815858','2026-11-07 20:03:45','2026-11-07 20:03:45',NULL,0,NULL,NULL),(37,'testing2','errors','testingerrors2@demo.test','2222222222','2026-11-08 21:08:05','2026-11-08 21:11:19',NULL,0,NULL,NULL),(38,'a','a','aa@gmail.com',NULL,'2026-11-09 01:28:38','2026-11-09 01:28:38',NULL,0,NULL,NULL),(39,'Marjorie','Monroe','mmonroe@demo.test','8932871983','2026-11-09 22:53:55','2026-11-09 22:53:55',NULL,0,NULL,NULL),(40,'demo7','test','demo7test@demo.test','8841568751','2026-11-10 19:51:00','2026-11-10 19:51:00',NULL,0,NULL,NULL),(41,'demo8','test','demo8test@demo.test','7815464513','2026-11-10 20:31:47','2026-11-10 20:31:47',NULL,0,NULL,NULL),(42,'demo9','test','demo9test@gmail.com','6844547218','2026-11-11 22:56:57','2026-11-11 22:56:57',NULL,0,NULL,NULL),(43,'customer11','test','customer10@demo.test','8945354513','2026-11-11 23:47:46','2026-11-11 23:48:24',NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customercredentials`
--

DROP TABLE IF EXISTS `customercredentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customercredentials` (
  `CustomerID` bigint unsigned NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  PRIMARY KEY (`CustomerID`),
  CONSTRAINT `fk_customercredentials_customer` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customercredentials`
--

LOCK TABLES `customercredentials` WRITE;
/*!40000 ALTER TABLE `customercredentials` DISABLE KEYS */;
INSERT INTO `customercredentials` VALUES (11,'d7e646a746e2697a1049ee08341ec276:207709906dce3964bae3dabf4c400bb972428a453c7b12cd6d1af5439996f4515f97c0a2497125a673b3c0b9632e8141810480b8fc39008e2d7b34c1f1684311','2026-10-24 21:01:27','2026-11-13 00:17:04'),(16,'4f5e695b7df0ad36652b0ebebb10af5b:f64b7b5ef8055b5a6dc00840b00be5d3d3afd31ae47d617c2965a665de836e63dbdfc57dad7b79d5ad87c552448c3c34b431e2cf0fc25cab1760ccbdcc3219ff','2026-10-24 21:02:33','2026-10-24 21:02:33'),(27,'8b14067ada5de1a5fd16be80b6756be4:606cdbbd7ad16535fa01a780a66541519c9aa11262aee01c6fc3af5e4b501d8462ee953797d62741c8585aa737b9558fd4e76762e8f3e4c1e2cc99695b079122','2026-10-25 21:16:51','2026-10-25 21:16:51'),(28,'405329b5128c48ae475fc8b56f7c2d0e:f8c60b55918f4b79de4fcc9072c135f439d4f308f48d2529186a3a93e9dd7e3d104785488a77f48d073a1e22dbbde051113ee03ee72579adc0b613c8e9d0e749','2026-10-26 15:43:02','2026-10-26 15:43:02'),(29,'71965357d2b30316acff5bc7fe78ec55:22cc498bcbd688a24fcab950a83ed55d332e188b3628a8ba79de949bb455dd8164e153a569af07235fdeb7b553c9396daf6dc8bbab567fd4d4f5e67a4d011222','2026-10-26 19:23:13','2026-10-26 19:23:13'),(30,'75e49d06487b143658ba16cda88b3a23:52bb03d867cadb020242712b5b6267a38e2f34b26c667d5e05ab65a033057523eca90a5b49fa59dd7ac8b25377cc8f76e5cb6cc6dc8b589b9504f9ec12a7a39a','2026-10-26 20:20:44','2026-11-04 17:10:08'),(31,'c6de1da8db84c8c66e2558e366df0ec7:1cfca8a33e86c9b2526b18e4e2bad9a8ef2a37d190eefa7e8fff33b6022326c829799d75bc795f709ff7fdaf337c0e17d2f149273eafc3e8d95a60ffa44a1dc0','2026-11-02 18:17:10','2026-11-02 18:17:10'),(32,'347730757b8c1fe4e6c22660d76873ff:1970fcc56a736f7c4ea28e896c93da17308300856b766b325606c574c694f74c31911cfecb1fc550c231a8794f9b3babe8d79e68da46f8afedef98623b31d4fb','2026-11-05 16:48:30','2026-11-05 16:48:30'),(35,'d0cd8b0f7ee679c408cdd1044fac4c19:f4eff61c2636521161e2248cbcfe69e12a5f420174d3ca64ca6e667dcf14322aaae810eda632e87ac2b0e247c0e30ea012e3dac4b88d75fdb4b6c1294788ec99','2026-11-05 20:50:28','2026-11-05 20:50:28'),(36,'bca62caac3e517a36e22a85a60c7d09e:e265d3d3f5496f3053e2c94a7ff75dc867400e1c4a72116f4b997e7ce0cd5c40a149fde2b7e8d5187e90617d19f37ef2dc29cd472edb00a2b81fe5c76f5415db','2026-11-07 20:03:45','2026-11-07 20:03:45'),(37,'c678d8d94945137e1305a1e79487b45a:8535da41baca2f886445d961f19762ab0d2e08c24b27f83b90289e37cfd53d72f1e8e2599af254e8ed5796c9629b4901cb894c3a31b5ac77136c72c11bcd6636','2026-11-08 21:08:05','2026-11-08 21:08:05'),(39,'4901ca06e188a77f65e1818f2e515abb:e34db3ed4576a7c8e963cc2979c95db32321b0ed8469fde0d712961b17f5ddc99710c0828bfa57fdd0e81c898fa6bff4a8a9d985327416fb59bd479ddf289876','2026-11-09 22:53:55','2026-11-09 22:53:55'),(40,'d64dc8d6922461b6b1e45b8f0e7b0752:b5cb714d11ef3b2205a66867da3cb72e3a5914cec65afc0449199b7747a7bce3054536f500b9e6e0b3a1fa8f470ca527bef7462e9df194f61b8d4270ea0c3b28','2026-11-10 19:51:00','2026-11-10 19:51:00'),(41,'4796038fe0489011dca8d2092bae7350:f3833c46c82facfafe26c755de2a9bc4c7487f4b73a446c1ed9e62799d0dec952a124896c43f03fad66bbe5e240c4957f78f81bf4dfc9c5206e9a55b270112ed','2026-11-10 20:31:47','2026-11-10 20:31:47'),(42,'6727082e50a393a1441e381f00203c28:df703ddfa6fef18df48a728d45ed2ef36c8c22756cfd79827597ef3e8b45b38ddf332599ac513662e1f2f2b5c6d13832c676c0d8d42df131093608954492dc20','2026-11-11 22:56:57','2026-11-11 22:56:57'),(43,'176d4ab0219894468f9d1e9a4fb48a12:debc837d87e819d0ce4d1487389ad616fc4fe3914549cdbad71bbfb4b975bd5d448bd7a1a23390ba3ae60531b6a64be3dd9d0dc982d5a018d4339a77664a31ce','2026-11-11 23:47:46','2026-11-11 23:47:46');
/*!40000 ALTER TABLE `customercredentials` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
INSERT INTO `donations` VALUES (1,'Jordan','Taylor','Credit Card',50.00,'2026-10-15','2026-10-21 08:24:10','2026-10-21 08:24:10',4,0),(2,'Morgan','Reed','Cash',25.00,'2026-10-16','2026-10-21 08:24:10','2026-10-21 08:24:10',4,0),(3,'Casey','Brooks','Bank Transfer',500.00,'2026-10-17','2026-10-21 08:24:10','2026-10-21 08:24:10',4,0),(4,'Riley','Morgan','Check',150.00,'2026-10-18','2026-10-21 08:24:10','2026-10-21 08:24:10',4,0),(5,'Alex','Parker','Credit Card',1000.00,'2026-10-20','2026-10-21 08:24:10','2026-10-21 08:24:10',4,0),(6,'Val','Kro','Debit Card',1.00,'2026-10-24','2026-10-25 03:23:25','2026-11-05 21:15:07',NULL,1),(7,'Shrinik','M','Bank Transfer',500.00,'2026-10-25','2026-10-25 21:22:58','2026-10-25 21:22:58',NULL,0),(8,'Nick','M','Credit Card',0.25,'2026-10-25','2026-10-25 21:23:37','2026-11-05 21:15:07',NULL,1),(9,'Valeriia','Krokhotina','Bank Transfer',400.00,'2026-10-26','2026-10-26 20:05:29','2026-10-26 20:06:31',NULL,1),(10,'Valeriia','Krokhotina','Cash',400.00,'2026-10-26','2026-10-26 20:06:44','2026-10-26 20:06:44',4,0),(11,'Brenda','Ozuna','Debit Card',1000.00,'2026-11-03','2026-11-03 19:43:30','2026-11-03 19:43:30',NULL,0),(12,'hghjg','hyghgj','Credit Card',500.00,'2026-11-05','2026-11-05 21:40:14','2026-11-05 21:40:14',NULL,0),(13,'Nick','M','Credit Card',1000.00,'2026-11-07','2026-11-07 20:28:42','2026-11-07 20:28:42',NULL,0),(14,'bnvbv','nbnmb','Credit Card',100.00,'2026-11-10','2026-11-10 20:04:52','2026-11-10 20:04:52',NULL,0),(15,'xcnxjc','xzczxc','Credit Card',250.00,'2026-11-10','2026-11-10 20:44:22','2026-11-10 20:44:22',NULL,0),(16,'Nick','MM','Credit Card',250.00,'2026-11-11','2026-11-11 23:08:54','2026-11-11 23:08:54',NULL,0),(17,'Vale','Ivanova','Credit Card',500.00,'2026-11-12','2026-11-13 00:54:32','2026-11-13 00:54:32',NULL,0);
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
  `CollectionID` bigint unsigned NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `CancelledBy` bigint unsigned DEFAULT NULL,
  `CancelledAt` datetime DEFAULT NULL,
  `CancellationReason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ExhibitionID`),
  KEY `fk_exhibition_createdby` (`CreatedBy`),
  KEY `fk_exhibition_collection` (`CollectionID`),
  KEY `fk_exhibition_cancelledby` (`CancelledBy`),
  CONSTRAINT `fk_exhibition_cancelledby` FOREIGN KEY (`CancelledBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_exhibition_collection` FOREIGN KEY (`CollectionID`) REFERENCES `collection` (`CollectionID`),
  CONSTRAINT `fk_exhibition_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_exhibition_cancel_info` CHECK (((`CancelledAt` is null) or (`CancelledBy` is not null))),
  CONSTRAINT `chk_exhibition_capacity` CHECK (((`Capacity` > 0) and (`Capacity` <= 1400))),
  CONSTRAINT `chk_exhibition_dates` CHECK ((`StartDate` < `EndDate`))
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exhibition`
--

LOCK TABLES `exhibition` WRITE;
/*!40000 ALTER TABLE `exhibition` DISABLE KEYS */;
INSERT INTO `exhibition` VALUES (1,'Museum Highlights','2027-01-15','2027-06-30','Artworks from different historical periods',300,1,'2026-10-18 19:44:42','2026-10-21 22:14:33',NULL,0,NULL,NULL,NULL),(2,'Impressionist Masters','2026-06-01','2026-12-31','Late 19th century French paintings',200,1,'2026-10-19 21:26:59','2026-11-10 16:41:03',4,1,4,'2026-10-25 00:41:04','zaptops is going to kill us all'),(3,'Modern Sculpture','2026-08-15','2027-01-31','20th century sculpture from around the world',150,3,'2026-10-19 21:26:59','2026-10-22 19:50:10',4,0,NULL,NULL,NULL),(4,'Photography Now','2026-09-01','2027-02-28','Contemporary photography',120,2,'2026-10-19 21:26:59','2026-11-10 16:56:44',4,1,4,'2026-10-25 20:35:42','something'),(5,'Abstraction','2026-02-01','2026-09-16','Section of abstract art',175,3,'2026-10-23 00:50:31','2026-10-25 20:34:59',4,1,4,'2026-10-23 04:46:32','Experienced an unforeseen disaster.'),(6,'test','2026-11-04','2026-11-26','exhibition test',50,2,'2026-11-03 06:31:55','2026-11-03 06:32:55',NULL,1,4,'2026-11-03 06:32:11','this is a test'),(7,'test2','2026-11-02','2026-11-04','test2',50,2,'2026-11-03 06:34:50','2026-11-03 06:35:05',NULL,1,4,'2026-11-03 06:34:59','test2'),(8,'test3','2026-11-03','2026-11-11','test3',50,2,'2026-11-03 06:38:22','2026-11-03 06:57:01',NULL,1,4,'2026-11-03 06:48:54','test cancellation for current tickets'),(9,'test4','2026-11-03','2026-11-10','waitlist test',1,2,'2026-11-03 06:57:24','2026-11-07 19:12:46',NULL,1,4,'2026-11-05 18:15:31','jhksdad'),(10,'DemoExhibition','2026-11-05','2026-11-07','Modern artwork',3,1,'2026-11-04 17:26:30','2026-11-07 19:12:47',NULL,1,4,'2026-11-04 17:41:30','Gallery renovation'),(11,'test1','2026-11-05','2026-11-07','Modern',3,3,'2026-11-04 17:52:52','2026-11-07 19:12:47',NULL,1,4,'2026-11-04 18:13:10','Museum was on burnt'),(12,'ajhgsdjahd','2026-11-05','2026-11-14','sdasdad',5,1,'2026-11-05 18:17:53','2026-11-07 19:12:47',NULL,1,4,'2026-11-05 18:19:45','dfdf'),(13,'test2','2026-11-06','2026-12-06','test description',150,3,'2026-11-05 18:57:03','2026-11-13 00:27:06',NULL,1,4,'2026-11-10 19:52:30','fire'),(14,'DemoE','2026-11-05','2026-11-07','Modern',3,3,'2026-11-05 20:55:01','2026-11-07 19:12:47',NULL,1,4,'2026-11-05 20:56:12','Fire'),(15,'DemoPractice','2026-11-05','2026-11-07','Modern',2,2,'2026-11-05 21:24:21','2026-11-07 19:12:47',NULL,1,4,'2026-11-05 21:28:04','Fire'),(16,'DemoPractice','2026-11-08','2026-11-10','Modernism',2,3,'2026-11-07 19:13:41','2026-11-10 16:56:44',NULL,1,4,'2026-11-07 20:05:19','fire'),(17,'TestingError','2026-11-09','2026-11-30','',34,1,'2026-11-08 16:30:13','2026-11-10 04:19:09',NULL,1,NULL,NULL,NULL),(18,'Demo7','2026-11-04','2026-11-20','Modern',3,3,'2026-11-10 20:30:06','2026-11-13 00:27:00',NULL,1,4,'2026-11-10 20:33:45','fire'),(19,'ModernDemo','2026-11-13','2026-11-30','Modern Art',3,3,'2026-11-11 22:43:06','2026-11-14 00:33:19',NULL,1,4,'2026-11-11 22:58:42','fire'),(20,'Modern Practice','2026-11-01','2026-11-30','Modern Ancient Art',3,3,'2026-11-11 22:43:52','2026-11-14 00:33:14',NULL,1,4,'2026-11-11 23:49:58','fire'),(21,'Demo10','2026-11-01','2027-01-01','Modern',300,1,'2026-11-12 16:43:58','2026-11-13 00:26:51',NULL,1,4,'2026-11-12 16:44:56','Drill'),(22,'Abstract Reflections','2026-11-01','2027-02-01','',300,3,'2026-11-12 16:53:41','2026-11-14 00:33:01',NULL,1,4,'2026-11-12 16:53:54','fire'),(23,'Test10','2026-11-12','2026-11-30','asbhfuavf',2,2,'2026-11-12 22:57:03','2026-11-13 00:27:12',NULL,1,4,'2026-11-12 22:58:49','fire'),(24,'Contemporary Practice','2026-11-13','2027-01-01','',4,3,'2026-11-13 06:31:56','2026-11-14 00:32:34',NULL,1,4,'2026-11-13 06:33:34','fire'),(25,'Modern Photography','2026-11-13','2027-01-02','',2,2,'2026-11-13 06:38:17','2026-11-14 00:32:51',NULL,1,4,'2026-11-13 06:43:16','fire'),(26,'Still Life','2026-11-13','2027-01-03','',2,3,'2026-11-13 06:58:46','2026-11-14 00:33:09',NULL,1,4,'2026-11-13 06:59:53','fire'),(27,'Modern Art','2026-11-13','2026-12-09','',2,3,'2026-11-13 07:13:35','2026-11-14 03:12:08',NULL,1,4,'2026-11-13 07:14:23','fire'),(28,'American Modernism','2026-11-13','2027-01-06','Modern',1,3,'2026-11-13 07:25:50','2026-11-13 07:26:32',NULL,0,4,'2026-11-13 07:26:32','fire'),(29,'Modern Art Demo','2026-11-13','2027-01-07','',1,3,'2026-11-13 08:18:05','2026-11-14 00:32:46',NULL,1,4,'2026-11-13 08:18:52','fire'),(30,'demo','2026-11-13','2027-01-06','',2,2,'2026-11-13 08:20:53','2026-11-13 08:23:24',NULL,1,4,'2026-11-13 08:21:30','fire'),(31,'20th Century','2026-11-13','2026-11-30','20th Century Artworks',2,2,'2026-11-13 23:30:46','2026-11-14 00:24:39',4,0,4,'2026-11-14 00:24:39','Fire'),(32,'Russian Culture','2026-11-30','2026-12-31','Russian Art in HTX',2,1,'2026-11-14 00:31:52','2026-11-14 00:34:24',4,0,4,'2026-11-14 00:34:24','Fire'),(33,'DemoExhibition','2026-11-14','2026-11-30','',2,1,'2026-11-14 00:37:46','2026-11-14 00:49:21',4,1,4,'2026-11-14 00:38:17','Fire'),(34,'Demo','2026-11-14','2026-11-20','',1,2,'2026-11-14 00:49:46','2026-11-14 00:50:50',4,1,4,'2026-11-14 00:50:14','Fire'),(35,'Demo','2026-11-14','2026-11-20','',2,1,'2026-11-14 00:53:34','2026-11-14 00:54:03',4,1,NULL,NULL,NULL),(36,'demo','2026-11-14','2026-11-27','',2,1,'2026-11-14 00:55:09','2026-11-14 00:58:28',4,1,4,'2026-11-14 00:58:07','just'),(37,'DemoExhibition','2026-12-01','2026-12-31','',3,1,'2026-11-14 04:48:31','2026-11-14 04:48:31',4,0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `exhibition` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`Team3`@`%`*/ /*!50003 TRIGGER `trg_exhibition_cancel_auth` BEFORE UPDATE ON `exhibition` FOR EACH ROW BEGIN
    -- For when an exhibition cancelled due to certain circumstances.
    DECLARE v_role VARCHAR(255);
    DECLARE v_end DATE;
    DECLARE v_deleted TINYINT;

    IF OLD.CancelledAt IS NULL AND NEW.CancelledBy IS NOT NULL THEN
        SELECT Role, EndDate, IsDeleted INTO v_role, v_end, v_deleted
        FROM staff WHERE StaffID = NEW.CancelledBy;

        IF v_role IS NULL
           OR v_deleted = 1
           OR (v_end IS NOT NULL AND v_end < CURDATE())
           OR v_role NOT IN ('Admin') THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only active Manager staff or Admin may cancel an exhibition';
        END IF;

        SET NEW.CancelledAt = NOW();
        SET NEW.UpdatedAt = NOW();
    END IF;

    IF OLD.CancelledAt IS NOT NULL
       AND (NEW.CancelledAt IS NULL OR NEW.CancelledBy IS NULL) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A cancelled exhibition cannot be reactivated';
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
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`Team3`@`%`*/ /*!50003 TRIGGER `trg_exhibition_cancel` AFTER UPDATE ON `exhibition` FOR EACH ROW BEGIN
  IF OLD.CancelledAt IS NULL AND NEW.CancelledAt IS NOT NULL THEN
    UPDATE ticket
    SET RefundStatus = 'Pending',
        NotificationStatus = 'Pending',
        UpdatedAt = NOW()
    WHERE ExhibitionID = NEW.ExhibitionID
      AND IsDeleted = 0
      AND RefundStatus = 'None'
      AND (VisitDate IS NULL OR VisitDate >= CURDATE());

    UPDATE waitlist
    SET Status = 'Cancelled'
    WHERE ExhibitionID = NEW.ExhibitionID
      AND Status IN ('Waiting', 'Notified');
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
INSERT INTO `exhibitionstaff` VALUES (1,2,'2026-10-18 19:49:38','2026-10-18 19:49:38',4),(1,6,'2026-10-18 19:49:38','2026-10-18 19:49:38',4),(2,2,'2026-10-20 19:15:13','2026-10-20 19:15:13',4),(2,6,'2026-10-22 19:07:58','2026-10-22 19:07:58',4),(3,6,'2026-10-22 19:50:10','2026-10-22 19:50:10',4),(4,6,'2026-10-22 19:07:58','2026-10-22 19:07:58',4),(6,6,'2026-11-03 06:31:55','2026-11-03 06:31:55',4),(7,6,'2026-11-03 06:34:50','2026-11-03 06:34:50',4),(8,6,'2026-11-03 06:38:22','2026-11-03 06:38:22',4),(9,6,'2026-11-03 06:57:24','2026-11-03 06:57:24',4),(10,6,'2026-11-04 17:26:30','2026-11-04 17:26:30',4),(11,6,'2026-11-04 17:52:52','2026-11-04 17:52:52',4),(12,6,'2026-11-05 18:17:53','2026-11-05 18:17:53',4),(13,6,'2026-11-05 18:57:03','2026-11-05 18:57:03',4),(14,6,'2026-11-05 20:55:01','2026-11-05 20:55:01',4),(15,6,'2026-11-05 21:24:21','2026-11-05 21:24:21',4),(16,6,'2026-11-07 19:13:41','2026-11-07 19:13:41',4),(16,9,'2026-11-07 19:13:41','2026-11-07 19:13:41',4),(17,9,'2026-11-08 16:30:13','2026-11-08 16:30:13',4),(18,6,'2026-11-10 20:30:07','2026-11-10 20:30:07',4),(18,9,'2026-11-10 20:30:07','2026-11-10 20:30:07',4),(19,6,'2026-11-11 22:43:06','2026-11-11 22:43:06',4),(19,9,'2026-11-11 22:43:06','2026-11-11 22:43:06',4),(20,6,'2026-11-11 22:43:52','2026-11-11 22:43:52',4),(20,9,'2026-11-11 22:43:52','2026-11-11 22:43:52',4),(21,6,'2026-11-12 16:43:58','2026-11-12 16:43:58',4),(21,9,'2026-11-12 16:43:58','2026-11-12 16:43:58',4),(22,6,'2026-11-12 16:53:41','2026-11-12 16:53:41',4),(22,9,'2026-11-12 16:53:41','2026-11-12 16:53:41',4),(23,6,'2026-11-12 22:57:03','2026-11-12 22:57:03',4),(23,9,'2026-11-12 22:57:03','2026-11-12 22:57:03',4),(24,6,'2026-11-13 06:31:56','2026-11-13 06:31:56',4),(24,9,'2026-11-13 06:31:56','2026-11-13 06:31:56',4),(25,9,'2026-11-13 06:38:17','2026-11-13 06:38:17',4),(26,9,'2026-11-13 06:58:46','2026-11-13 06:58:46',4),(27,9,'2026-11-13 07:13:36','2026-11-13 07:13:36',4),(28,9,'2026-11-13 07:25:50','2026-11-13 07:25:50',4),(29,9,'2026-11-13 08:18:06','2026-11-13 08:18:06',4),(30,9,'2026-11-13 08:20:53','2026-11-13 08:20:53',4),(31,6,'2026-11-13 23:30:46','2026-11-13 23:30:46',4),(31,9,'2026-11-13 23:30:46','2026-11-13 23:30:46',4),(32,9,'2026-11-14 00:31:53','2026-11-14 00:31:53',4),(33,9,'2026-11-14 00:37:46','2026-11-14 00:37:46',4),(34,9,'2026-11-14 00:49:47','2026-11-14 00:49:47',4),(35,9,'2026-11-14 00:53:34','2026-11-14 00:53:34',4),(36,6,'2026-11-14 00:55:09','2026-11-14 00:55:09',4),(37,9,'2026-11-14 04:48:32','2026-11-14 04:48:32',4);
/*!40000 ALTER TABLE `exhibitionstaff` ENABLE KEYS */;
UNLOCK TABLES;

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
  `ReorderLevel` int NOT NULL DEFAULT '20',
  PRIMARY KEY (`ItemID`),
  KEY `fk_giftshop_staff` (`StaffID`),
  KEY `fk_giftshop_createdby` (`CreatedBy`),
  CONSTRAINT `fk_giftshop_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_giftshop_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_giftshop_price` CHECK ((`Price` > 0)),
  CONSTRAINT `chk_giftshop_reorder` CHECK ((`ReorderLevel` >= 0)),
  CONSTRAINT `chk_giftshop_stock` CHECK ((`Stock` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giftshop`
--

LOCK TABLES `giftshop` WRITE;
/*!40000 ALTER TABLE `giftshop` DISABLE KEYS */;
INSERT INTO `giftshop` VALUES (1,'Art Print Poster','Prints',6,18.00,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,80,20),(2,'Museum Tote Bag','Accessories',6,25.00,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,71,20),(3,'Exhibition Catalog','Books',6,45.00,'2026-10-19 21:26:59','2026-11-05 21:19:13',4,0,93,20),(4,'Postcard Set','Stationery',6,9.50,'2026-10-19 21:26:59','2026-11-13 08:08:39',4,0,30,20),(5,'Ceramic Mug','Home',6,14.00,'2026-10-19 21:26:59','2026-11-13 08:08:28',4,0,19,20),(6,'Museum Pins','Accessories',6,5.00,'2026-10-26 03:38:20','2026-11-12 21:40:30',4,0,100,20),(7,'Museum Keychains','Accessories',6,7.00,'2026-10-26 05:30:49','2026-11-12 22:10:10',NULL,0,100,20),(8,'Exhibition Badges','Accessories',4,25.00,'2026-10-26 05:38:41','2026-11-11 22:48:00',NULL,0,29,20),(9,'Museum Puzzles','Kids',4,20.00,'2026-10-26 06:00:03','2026-10-26 06:05:38',NULL,1,54,20),(10,'Museum Puzzles','Kids',6,25.00,'2026-10-26 06:07:33','2026-11-12 22:10:24',NULL,0,100,20),(11,'Exhibition Plushies','Kids',6,45.00,'2026-10-26 06:08:59','2026-10-26 06:09:15',NULL,1,44,20),(12,'jabsbakhbf','Accessories',6,1123.00,'2026-11-02 18:21:42','2026-11-11 22:55:05',NULL,0,222,20),(13,'test','Accessories',6,0.01,'2026-11-11 22:54:52','2026-11-11 22:55:13',NULL,1,1,20),(14,'Museum Wallet','Accessories',6,25.00,'2026-11-12 16:56:28','2026-11-13 06:49:44',NULL,0,100,20);
/*!40000 ALTER TABLE `giftshop` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`Team3`@`%`*/ /*!50003 TRIGGER `trg_giftshop_low_stock` AFTER UPDATE ON `giftshop` FOR EACH ROW BEGIN
  IF OLD.Stock > OLD.ReorderLevel AND NEW.Stock <= NEW.ReorderLevel
     AND NEW.IsDeleted = 0
     AND NOT EXISTS (SELECT 1 FROM staffalert
                     WHERE AlertType = 'LowStock' AND ItemID = NEW.ItemID
                       AND Status = 'Pending') THEN
    INSERT INTO staffalert (StaffID, AlertType, ItemID, Message)
    VALUES (NEW.StaffID, 'LowStock', NEW.ItemID,
            CONCAT('Low stock: "', NEW.ItemName, '" has ', NEW.Stock,
                   ' left. Please place an order as soon as possible.'));
  END IF;

  IF OLD.Stock <= OLD.ReorderLevel AND NEW.Stock > NEW.ReorderLevel THEN
    UPDATE staffalert
    SET Status = 'Resolved', ResolvedAt = NOW()
    WHERE AlertType = 'LowStock' AND ItemID = NEW.ItemID AND Status = 'Pending';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
  `CustomerID` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`SaleID`),
  KEY `fk_giftshopsale_item` (`ItemID`),
  KEY `fk_giftshopsale_staff` (`StaffID`),
  KEY `fk_giftshopsale_createdby` (`CreatedBy`),
  KEY `fk_giftshopsale_membership` (`MembershipID`),
  KEY `fk_giftshopsale_customer` (`CustomerID`),
  CONSTRAINT `fk_giftshopsale_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_giftshopsale_customer` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`),
  CONSTRAINT `fk_giftshopsale_item` FOREIGN KEY (`ItemID`) REFERENCES `giftshop` (`ItemID`),
  CONSTRAINT `fk_giftshopsale_membership` FOREIGN KEY (`MembershipID`) REFERENCES `membership` (`MembershipID`),
  CONSTRAINT `fk_giftshopsale_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_giftshopsale_payment` CHECK ((`PaymentMethod` in (_utf8mb4'Cash',_utf8mb4'Credit Card',_utf8mb4'Debit Card',_utf8mb4'Mobile Pay'))),
  CONSTRAINT `chk_giftshopsale_price` CHECK ((`SalePrice` > 0)),
  CONSTRAINT `chk_giftshopsale_quantity` CHECK ((`Quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giftshopsale`
--

LOCK TABLES `giftshopsale` WRITE;
/*!40000 ALTER TABLE `giftshopsale` DISABLE KEYS */;
INSERT INTO `giftshopsale` VALUES (27,1,18.00,2,6,'2026-07-14','Credit Card','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,NULL,NULL),(28,1,18.00,1,7,'2026-08-22','Cash','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,NULL,NULL),(29,1,18.00,3,7,'2026-09-18','Debit Card','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,2,2),(30,2,25.00,1,6,'2026-07-30','Credit Card','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,NULL,NULL),(31,2,25.00,2,7,'2026-09-05','Mobile Pay','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,NULL,NULL),(32,2,25.00,1,7,'2026-10-12','Credit Card','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,1,1),(33,3,45.00,1,6,'2026-08-09','Credit Card','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,NULL,NULL),(34,3,45.00,2,7,'2026-09-27','Debit Card','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,3,3),(35,3,45.00,1,7,'2026-10-16','Credit Card','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,NULL,NULL),(36,4,9.50,4,6,'2026-07-21','Cash','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,NULL,NULL),(37,4,9.50,5,7,'2026-09-14','Mobile Pay','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,NULL,NULL),(38,5,14.00,2,7,'2026-08-29','Credit Card','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,NULL,NULL),(39,5,14.00,3,6,'2026-10-09','Debit Card','2026-10-20 03:03:53','2026-10-20 03:03:53',4,0,4,4),(40,1,18.00,1,4,'2026-10-20','Cash','2026-10-20 19:35:46','2026-10-20 19:35:46',4,0,NULL,NULL),(41,2,25.00,1,6,'2026-10-23','Credit Card','2026-10-23 03:37:41','2026-10-23 03:37:41',NULL,0,1,1),(42,3,45.00,1,6,'2026-10-23','Debit Card','2026-10-23 03:38:20','2026-10-23 03:38:20',NULL,0,1,1),(60,1,18.00,3,6,'2026-10-23','Credit Card','2026-10-23 16:10:44','2026-10-23 16:10:44',NULL,0,12,11),(61,2,25.00,4,6,'2026-10-23','Credit Card','2026-10-23 16:10:45','2026-10-23 16:10:45',NULL,0,12,11),(62,4,9.50,4,6,'2026-10-23','Credit Card','2026-10-23 16:10:45','2026-10-23 16:10:45',NULL,0,12,11),(63,1,18.00,6,6,'2026-11-02','Credit Card','2026-11-02 18:18:20','2026-11-02 18:18:20',NULL,0,NULL,31),(64,3,45.00,1,4,'2026-11-02','Credit Card','2026-11-02 18:18:21','2026-11-02 18:18:21',NULL,0,NULL,31),(65,5,14.00,1,6,'2026-11-02','Credit Card','2026-11-02 18:18:21','2026-11-02 18:18:21',NULL,0,NULL,31),(66,6,5.00,1,6,'2026-11-02','Credit Card','2026-11-02 18:18:21','2026-11-02 18:18:21',NULL,0,NULL,31),(67,7,7.00,1,4,'2026-11-02','Credit Card','2026-11-02 18:18:21','2026-11-02 18:18:21',NULL,0,NULL,31),(68,8,25.00,1,4,'2026-11-02','Credit Card','2026-11-02 18:18:21','2026-11-02 18:18:21',NULL,0,NULL,31),(69,10,25.00,6,6,'2026-11-02','Credit Card','2026-11-02 18:18:21','2026-11-02 18:18:21',NULL,0,NULL,31),(70,5,11.20,1,6,'2026-11-03','Credit Card','2026-11-03 16:58:32','2026-11-03 16:58:32',NULL,0,12,11),(71,10,21.25,13,4,'2026-11-05','Credit Card','2026-11-05 20:59:37','2026-11-05 20:59:37',NULL,0,12,11),(72,5,11.90,1,6,'2026-11-05','Debit Card','2026-11-05 21:26:05','2026-11-05 21:26:05',NULL,0,28,35),(73,2,21.25,20,6,'2026-11-05','Credit Card','2026-11-05 21:42:04','2026-11-05 21:42:04',NULL,0,28,35),(74,7,5.95,10,6,'2026-11-07','Credit Card','2026-11-07 20:31:33','2026-11-07 20:31:33',NULL,0,12,11),(75,1,15.30,1,6,'2026-11-08','Credit Card','2026-11-08 20:52:09','2026-11-08 20:52:09',NULL,0,12,11),(76,1,15.30,1,6,'2026-11-08','Debit Card','2026-11-08 21:10:04','2026-11-08 21:10:04',NULL,0,30,37),(77,5,11.90,1,6,'2026-11-08','Debit Card','2026-11-08 21:10:07','2026-11-08 21:10:07',NULL,0,30,37),(78,5,14.00,6,6,'2026-11-10','Credit Card','2026-11-10 19:51:21','2026-11-10 19:51:21',NULL,0,NULL,40),(79,8,21.25,25,4,'2026-11-10','Debit Card','2026-11-10 19:56:17','2026-11-10 19:56:17',NULL,0,12,11),(80,5,14.00,4,6,'2026-11-10','Credit Card','2026-11-10 20:32:04','2026-11-10 20:32:04',NULL,0,NULL,41),(81,10,21.25,20,6,'2026-11-10','Credit Card','2026-11-10 20:36:51','2026-11-10 20:36:51',NULL,0,12,11),(82,5,14.00,3,6,'2026-11-11','Credit Card','2026-11-11 22:57:14','2026-11-11 22:57:14',NULL,0,NULL,42),(83,7,5.95,16,4,'2026-11-11','Credit Card','2026-11-11 23:02:13','2026-11-11 23:02:13',NULL,0,12,11),(84,5,14.00,4,6,'2026-11-11','Credit Card','2026-11-11 23:48:00','2026-11-11 23:48:00',NULL,0,NULL,43),(85,6,4.25,22,4,'2026-11-11','Debit Card','2026-11-11 23:55:43','2026-11-11 23:55:43',NULL,0,12,11),(86,14,21.25,27,4,'2026-11-12','Debit Card','2026-11-12 16:57:17','2026-11-12 16:57:17',NULL,0,12,11),(87,1,15.30,1,6,'2026-11-12','Credit Card','2026-11-12 22:52:25','2026-11-12 22:52:25',NULL,0,12,11),(88,14,21.25,88,6,'2026-11-13','Credit Card','2026-11-13 06:24:54','2026-11-13 06:24:54',NULL,0,12,11),(89,4,8.07,66,6,'2026-11-13','Credit Card','2026-11-13 06:48:54','2026-11-13 06:48:54',NULL,0,12,11),(90,4,8.07,4,6,'2026-11-13','Credit Card','2026-11-13 07:57:02','2026-11-13 07:57:02',NULL,0,12,11),(91,5,11.90,55,6,'2026-11-13','Debit Card','2026-11-13 08:02:07','2026-11-13 08:02:07',NULL,0,12,11),(92,5,11.90,6,6,'2026-11-13','Credit Card','2026-11-13 08:09:05','2026-11-13 08:09:05',NULL,0,12,11),(93,1,15.30,1,6,'2026-11-14','Credit Card','2026-11-14 01:23:30','2026-11-14 01:23:30',NULL,0,12,11);
/*!40000 ALTER TABLE `giftshopsale` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`Team3`@`%`*/ /*!50003 TRIGGER `trg_giftshopsale_stock_decrement` AFTER INSERT ON `giftshopsale` FOR EACH ROW BEGIN
    UPDATE giftshop
    SET Stock = Stock - NEW.Quantity
    WHERE ItemID = NEW.ItemID;
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
  `CustomerID` bigint unsigned NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`MembershipID`),
  UNIQUE KEY `uq_membership_customer` (`CustomerID`),
  KEY `fk_membership_createdby` (`CreatedBy`),
  CONSTRAINT `fk_membership_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_membership_customer` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership`
--

LOCK TABLES `membership` WRITE;
/*!40000 ALTER TABLE `membership` DISABLE KEYS */;
INSERT INTO `membership` VALUES (1,1,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0),(2,2,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0),(3,3,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0),(4,4,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0),(5,5,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0),(6,6,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0),(7,7,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0),(8,8,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0),(9,9,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0),(10,10,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0),(12,11,'2026-10-23 15:28:37','2026-11-14 03:39:32',NULL,0),(13,17,'2026-10-25 14:39:36','2026-10-25 14:39:36',NULL,0),(14,18,'2026-10-25 14:44:34','2026-10-25 14:44:34',NULL,0),(15,19,'2026-10-25 14:56:20','2026-10-25 16:42:00',NULL,0),(16,20,'2026-10-25 15:08:24','2026-10-25 16:12:48',NULL,1),(17,21,'2026-10-25 15:12:21','2026-10-25 16:12:48',NULL,1),(18,22,'2026-10-25 15:44:49','2026-10-25 15:44:49',NULL,0),(19,23,'2026-10-25 16:09:43','2026-10-25 16:53:14',NULL,1),(20,24,'2026-10-25 16:12:09','2026-10-25 16:12:09',NULL,0),(21,25,'2026-10-25 16:14:57','2026-10-25 16:14:57',NULL,0),(22,26,'2026-10-25 16:19:03','2026-10-25 16:52:04',NULL,0),(23,27,'2026-10-25 21:17:35','2026-10-25 21:17:35',NULL,0),(24,29,'2026-10-26 19:44:07','2026-10-26 19:44:14',NULL,0),(25,30,'2026-10-26 20:20:58','2026-11-10 04:17:59',NULL,1),(26,31,'2026-11-02 18:18:55','2026-11-02 18:18:55',NULL,0),(27,32,'2026-11-05 17:05:29','2026-11-05 17:05:29',NULL,0),(28,35,'2026-11-05 20:59:18','2026-11-05 20:59:18',NULL,0),(29,36,'2026-11-07 20:12:33','2026-11-07 20:12:33',NULL,0),(30,37,'2026-11-08 21:08:34','2026-11-08 21:38:59',NULL,0),(31,38,'2026-11-09 01:28:38','2026-11-09 01:29:13',NULL,1),(32,40,'2026-11-10 19:59:38','2026-11-10 19:59:38',NULL,0),(33,41,'2026-11-10 20:38:21','2026-11-10 20:38:21',NULL,0),(34,42,'2026-11-11 23:03:07','2026-11-11 23:03:07',NULL,0),(35,43,'2026-11-11 23:57:50','2026-11-11 23:57:50',NULL,0);
/*!40000 ALTER TABLE `membership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membershipfamilymember`
--

DROP TABLE IF EXISTS `membershipfamilymember`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membershipfamilymember` (
  `FamilyMemberID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MembershipID` bigint unsigned NOT NULL,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `DateOfBirth` date NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FamilyMemberID`),
  KEY `idx_familymember_membership` (`MembershipID`),
  CONSTRAINT `fk_familymember_membership` FOREIGN KEY (`MembershipID`) REFERENCES `membership` (`MembershipID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membershipfamilymember`
--

LOCK TABLES `membershipfamilymember` WRITE;
/*!40000 ALTER TABLE `membershipfamilymember` DISABLE KEYS */;
INSERT INTO `membershipfamilymember` VALUES (1,16,'Child','Test','2015-08-20','2026-10-25 15:08:24'),(2,17,'Adult','Two','1988-04-10','2026-10-25 15:12:21'),(3,17,'Child','One','2015-01-01','2026-10-25 15:12:21'),(4,17,'Child','Two','2016-02-02','2026-10-25 15:12:21'),(5,17,'Child','Three','2017-03-03','2026-10-25 15:12:21'),(6,17,'Child','Four','2018-04-04','2026-10-25 15:12:21'),(7,17,'Child','Five','2019-05-05','2026-10-25 15:12:22'),(8,17,'Child','Six','2020-06-06','2026-10-25 15:12:22'),(9,18,'Ben','Johnson','2024-07-04','2026-10-25 15:44:49'),(10,18,'David','Johnson','2025-07-19','2026-10-25 15:44:49'),(12,22,'Casey','FamilyTest','2015-05-20','2026-10-25 16:52:04');
/*!40000 ALTER TABLE `membershipfamilymember` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membershipterm`
--

DROP TABLE IF EXISTS `membershipterm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membershipterm` (
  `TermID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MembershipID` bigint unsigned NOT NULL,
  `MembershipType` varchar(255) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Price` decimal(8,2) NOT NULL,
  `DiscountPercent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `PaymentMethod` varchar(255) NOT NULL,
  `CancelledAt` datetime DEFAULT NULL,
  `CreatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`TermID`),
  KEY `fk_membershipterm_membership` (`MembershipID`),
  KEY `fk_membershipterm_createdby` (`CreatedBy`),
  CONSTRAINT `fk_membershipterm_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_membershipterm_membership` FOREIGN KEY (`MembershipID`) REFERENCES `membership` (`MembershipID`),
  CONSTRAINT `chk_membershipterm_dates` CHECK ((`StartDate` < `EndDate`)),
  CONSTRAINT `chk_membershipterm_discount` CHECK ((`DiscountPercent` between 0 and 100)),
  CONSTRAINT `chk_membershipterm_payment` CHECK ((`PaymentMethod` in (_utf8mb3'Cash',_utf8mb3'Credit Card',_utf8mb3'Debit Card',_utf8mb3'Bank Transfer'))),
  CONSTRAINT `chk_membershipterm_price` CHECK ((`Price` > 0)),
  CONSTRAINT `chk_membershipterm_type` CHECK ((`MembershipType` in (_utf8mb4'Dual',_utf8mb4'Family',_utf8mb4'Student',_utf8mb4'Senior')))
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membershipterm`
--

LOCK TABLES `membershipterm` WRITE;
/*!40000 ALTER TABLE `membershipterm` DISABLE KEYS */;
INSERT INTO `membershipterm` VALUES (1,1,'Dual','2026-01-10','2027-01-10',75.00,25.00,'Credit Card',NULL,'2026-10-19 21:26:59',4),(2,2,'Family','2026-02-01','2027-02-01',150.00,25.00,'Credit Card',NULL,'2026-10-19 21:26:59',4),(3,3,'Student','2026-03-15','2027-03-15',40.00,35.00,'Debit Card',NULL,'2026-10-19 21:26:59',4),(4,4,'Senior','2026-04-01','2027-04-01',55.00,30.00,'Cash',NULL,'2026-10-19 21:26:59',4),(5,5,'Dual','2025-11-10','2026-11-10',75.00,25.00,'Bank Transfer',NULL,'2026-10-19 21:26:59',4),(6,6,'Family','2025-11-05','2026-11-05',150.00,25.00,'Credit Card',NULL,'2026-10-19 21:26:59',4),(7,7,'Student','2026-05-01','2027-05-01',40.00,35.00,'Cash',NULL,'2026-10-19 21:26:59',4),(8,8,'Senior','2025-08-01','2026-08-01',55.00,20.00,'Credit Card',NULL,'2026-10-19 21:26:59',4),(9,9,'Family','2026-06-01','2027-06-01',150.00,25.00,'Debit Card',NULL,'2026-10-19 21:26:59',4),(10,10,'Dual','2026-07-01','2027-07-01',75.00,25.00,'Credit Card',NULL,'2026-10-19 21:26:59',4),(11,12,'Dual','2026-10-23','2027-10-23',75.00,10.00,'Credit Card','2026-10-23 16:33:10','2026-10-23 15:28:37',NULL),(16,12,'Family','2026-10-23','2027-10-23',150.00,10.00,'Debit Card','2026-10-23 16:33:21','2026-10-23 16:33:10',NULL),(17,12,'Dual','2026-10-23','2027-10-23',75.00,5.00,'Debit Card','2026-10-23 20:06:45','2026-10-23 16:33:31',NULL),(18,12,'Family','2026-10-23','2027-10-23',150.00,10.00,'Credit Card','2026-10-23 20:09:35','2026-10-23 20:07:09',NULL),(19,12,'Dual','2026-10-23','2027-10-23',75.00,5.00,'Debit Card','2026-10-24 20:42:55','2026-10-23 20:09:35',NULL),(20,12,'Family','2026-10-24','2027-10-24',150.00,10.00,'Debit Card','2026-10-25 14:24:49','2026-10-24 20:42:55',NULL),(21,12,'Student','2026-10-25','2027-10-25',40.00,10.00,'Debit Card','2026-10-25 20:37:53','2026-10-25 14:24:49',NULL),(22,13,'Student','2026-10-26','2027-10-25',40.00,35.00,'Credit Card',NULL,'2026-10-25 14:39:36',NULL),(23,14,'Dual','2026-10-26','2027-10-25',75.00,25.00,'Credit Card',NULL,'2026-10-25 14:44:34',NULL),(24,15,'Senior','2026-10-26','2027-10-25',60.00,30.00,'Credit Card',NULL,'2026-10-25 14:56:20',NULL),(25,16,'Family','2026-10-26','2027-10-25',120.00,25.00,'Credit Card',NULL,'2026-10-25 15:08:24',NULL),(26,17,'Family','2026-10-26','2027-10-25',120.00,25.00,'Credit Card',NULL,'2026-10-25 15:12:21',NULL),(27,18,'Family','2026-10-25','2027-10-25',150.00,25.00,'Debit Card',NULL,'2026-10-25 15:44:49',NULL),(28,19,'Dual','2026-10-26','2027-10-25',75.00,25.00,'Credit Card',NULL,'2026-10-25 16:09:44',NULL),(29,20,'Student','2026-10-26','2027-10-25',40.00,35.00,'Credit Card',NULL,'2026-10-25 16:12:09',NULL),(30,21,'Senior','2026-10-25','2027-10-25',60.00,30.00,'Credit Card',NULL,'2026-10-25 16:14:58',NULL),(31,22,'Family','2026-10-26','2027-10-25',150.00,25.00,'Credit Card',NULL,'2026-10-25 16:19:03',NULL),(32,12,'Dual','2026-10-25','2027-10-25',75.00,5.00,'Credit Card','2026-10-25 20:54:12','2026-10-25 20:37:53',NULL),(33,12,'Family','2026-10-25','2027-10-25',150.00,10.00,'Credit Card','2026-10-26 10:55:32','2026-10-25 20:54:12',NULL),(34,23,'Student','2026-10-25','2027-10-25',40.00,35.00,'Credit Card',NULL,'2026-10-25 21:17:36',NULL),(35,12,'Student','2026-10-26','2027-10-26',40.00,10.00,'Credit Card','2026-10-26 11:22:51','2026-10-26 10:55:32',NULL),(36,12,'Dual','2026-10-26','2027-10-26',75.00,5.00,'Debit Card','2026-10-26 11:39:26','2026-10-26 11:22:52',NULL),(37,12,'Senior','2026-10-26','2027-10-26',60.00,15.00,'Credit Card','2026-10-26 12:05:38','2026-10-26 11:39:26',NULL),(38,12,'Dual','2026-10-26','2027-10-26',75.00,5.00,'Debit Card','2026-10-26 12:06:22','2026-10-26 12:05:39',NULL),(39,12,'Student','2026-10-26','2027-10-26',40.00,10.00,'Credit Card','2026-10-26 12:06:42','2026-10-26 12:06:22',NULL),(40,12,'Family','2026-10-26','2027-10-26',150.00,10.00,'Credit Card','2026-10-26 14:58:29','2026-10-26 12:06:42',NULL),(41,12,'Student','2026-10-26','2027-10-26',40.00,35.00,'Debit Card','2026-10-26 15:21:20','2026-10-26 14:58:29',NULL),(42,12,'Dual','2026-10-26','2027-10-26',75.00,25.00,'Debit Card','2026-10-26 15:25:14','2026-10-26 15:21:20',NULL),(43,12,'Student','2026-10-26','2027-10-26',40.00,35.00,'Credit Card','2026-10-26 18:32:45','2026-10-26 15:25:14',NULL),(44,12,'Senior','2026-10-26','2027-10-26',60.00,30.00,'Credit Card','2026-10-26 18:34:01','2026-10-26 18:32:45',NULL),(45,12,'Dual','2026-10-26','2027-10-26',75.00,25.00,'Credit Card','2026-10-26 20:10:07','2026-10-26 18:34:01',NULL),(46,24,'Student','2026-10-26','2027-10-26',40.00,35.00,'Credit Card','2026-10-26 19:44:14','2026-10-26 19:44:08',NULL),(47,24,'Family','2026-10-26','2027-10-26',150.00,25.00,'Credit Card',NULL,'2026-10-26 19:44:14',NULL),(48,12,'Senior','2026-10-26','2027-10-26',60.00,30.00,'Credit Card','2026-10-26 20:10:17','2026-10-26 20:10:07',NULL),(49,12,'Dual','2026-10-26','2027-10-26',75.00,25.00,'Credit Card','2026-10-26 20:19:16','2026-10-26 20:10:30',NULL),(50,12,'Dual','2026-10-26','2027-10-26',75.00,25.00,'Debit Card','2026-10-26 21:25:57','2026-10-26 20:20:21',NULL),(51,25,'Dual','2026-10-26','2027-10-26',75.00,25.00,'Credit Card','2026-11-04 18:14:00','2026-10-26 20:20:58',NULL),(52,12,'Family','2026-10-26','2027-10-26',150.00,25.00,'Credit Card','2026-10-26 21:26:37','2026-10-26 21:25:57',NULL),(53,12,'Student','2026-10-26','2027-10-26',40.00,35.00,'Credit Card','2026-10-26 21:27:10','2026-10-26 21:26:37',NULL),(54,12,'Senior','2026-10-26','2027-10-26',60.00,30.00,'Credit Card','2026-10-26 21:58:59','2026-10-26 21:27:10',NULL),(55,12,'Dual','2026-10-26','2027-10-26',75.00,25.00,'Credit Card','2026-10-26 22:16:29','2026-10-26 21:58:59',NULL),(56,12,'Student','2026-10-26','2027-10-26',40.00,35.00,'Credit Card','2026-10-26 22:16:53','2026-10-26 22:16:29',NULL),(57,12,'Senior','2026-10-26','2027-10-26',60.00,30.00,'Credit Card','2026-10-26 22:17:30','2026-10-26 22:16:53',NULL),(58,12,'Student','2026-10-26','2027-10-26',40.00,35.00,'Credit Card','2026-10-29 18:09:25','2026-10-26 22:17:30',NULL),(59,12,'Family','2026-10-29','2027-10-29',150.00,25.00,'Debit Card','2026-10-29 18:10:22','2026-10-29 18:09:25',NULL),(60,12,'Senior','2026-10-29','2027-10-29',60.00,30.00,'Debit Card','2026-10-29 18:11:28','2026-10-29 18:10:22',NULL),(61,12,'Student','2026-10-29','2027-10-29',40.00,35.00,'Credit Card','2026-10-29 18:13:36','2026-10-29 18:11:28',NULL),(62,12,'Dual','2026-10-29','2027-10-29',75.00,25.00,'Credit Card','2026-11-02 23:13:21','2026-10-29 18:13:36',NULL),(63,26,'Family','2026-11-02','2027-11-02',150.00,25.00,'Credit Card',NULL,'2026-11-02 18:18:55',NULL),(64,12,'Senior','2026-11-02','2027-11-02',60.00,30.00,'Credit Card','2026-11-02 23:13:58','2026-11-02 23:13:21',NULL),(65,12,'Student','2026-11-02','2027-11-02',40.00,35.00,'Credit Card','2026-11-03 19:40:30','2026-11-02 23:13:58',NULL),(66,12,'Dual','2026-11-03','2027-11-03',75.00,25.00,'Credit Card','2026-11-03 19:45:02','2026-11-03 19:40:30',NULL),(67,12,'Senior','2026-11-03','2027-11-03',60.00,30.00,'Credit Card','2026-11-03 19:45:13','2026-11-03 19:45:02',NULL),(68,12,'Family','2026-11-03','2027-11-03',150.00,25.00,'Credit Card','2026-11-03 19:45:40','2026-11-03 19:45:13',NULL),(69,12,'Senior','2026-11-03','2027-11-03',60.00,30.00,'Debit Card','2026-11-03 20:00:00','2026-11-03 19:45:40',NULL),(70,12,'Dual','2026-11-03','2027-11-03',75.00,25.00,'Credit Card','2026-11-03 20:01:32','2026-11-03 20:00:01',NULL),(71,12,'Family','2026-11-03','2027-11-03',150.00,25.00,'Credit Card','2026-11-05 15:06:06','2026-11-03 20:01:32',NULL),(72,25,'Dual','2026-11-04','2027-11-04',75.00,25.00,'Credit Card',NULL,'2026-11-04 18:16:24',NULL),(73,12,'Senior','2026-11-05','2027-11-05',60.00,30.00,'Debit Card','2026-11-05 15:07:54','2026-11-05 15:06:06',NULL),(74,12,'Student','2026-11-05','2027-11-05',40.00,35.00,'Debit Card','2026-11-05 16:46:08','2026-11-05 15:07:54',NULL),(75,27,'Family','2026-11-05','2027-11-05',150.00,25.00,'Credit Card',NULL,'2026-11-05 17:05:29',NULL),(76,12,'Dual','2026-11-05','2027-11-05',75.00,25.00,'Credit Card','2026-11-11 22:20:54','2026-11-05 18:18:13',NULL),(77,28,'Family','2026-11-05','2027-11-05',150.00,25.00,'Credit Card',NULL,'2026-11-05 20:59:18',NULL),(78,29,'Family','2026-11-07','2027-11-07',150.00,25.00,'Credit Card',NULL,'2026-11-07 20:12:33',NULL),(79,30,'Dual','2026-11-08','2027-11-08',75.00,25.00,'Credit Card','2026-11-08 21:08:43','2026-11-08 21:08:34',NULL),(80,30,'Family','2026-11-08','2027-11-08',150.00,25.00,'Credit Card','2026-11-08 21:09:16','2026-11-08 21:08:43',NULL),(81,30,'Dual','2026-11-08','2027-11-08',75.00,25.00,'Credit Card','2026-11-08 21:38:52','2026-11-08 21:09:26',NULL),(82,30,'Dual','2026-11-08','2027-11-08',75.00,25.00,'Credit Card',NULL,'2026-11-08 21:38:59',NULL),(83,31,'Dual','2026-11-09','2026-11-17',75.00,25.00,'Cash',NULL,'2026-11-09 01:28:38',NULL),(84,32,'Family','2026-11-10','2027-11-10',150.00,25.00,'Credit Card',NULL,'2026-11-10 19:59:38',NULL),(85,33,'Family','2026-11-10','2027-11-10',150.00,25.00,'Credit Card',NULL,'2026-11-10 20:38:21',NULL),(86,12,'Family','2026-11-11','2027-11-11',150.00,25.00,'Credit Card','2026-11-12 23:02:24','2026-11-11 22:20:54',NULL),(87,34,'Family','2026-11-11','2027-11-11',150.00,25.00,'Credit Card',NULL,'2026-11-11 23:03:07',NULL),(88,35,'Family','2026-11-11','2027-11-11',150.00,25.00,'Credit Card',NULL,'2026-11-11 23:57:50',NULL),(89,12,'Dual','2026-11-12','2027-11-12',75.00,25.00,'Credit Card','2026-11-14 03:35:02','2026-11-12 23:49:21',NULL),(90,12,'Family','2026-11-14','2027-11-14',150.00,25.00,'Debit Card','2026-11-14 03:39:32','2026-11-14 03:35:02',NULL),(91,12,'Dual','2026-11-14','2027-11-14',75.00,25.00,'Debit Card',NULL,'2026-11-14 03:39:32',NULL);
/*!40000 ALTER TABLE `membershipterm` ENABLE KEYS */;
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
  UNIQUE KEY `uq_staff_email` (`Email`),
  KEY `fk_staff_createdby` (`CreatedBy`),
  CONSTRAINT `fk_staff_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_staff_role` CHECK ((`Role` in (_utf8mb4'Admin',_utf8mb4'Staff')))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'Avery','Hong','Admin','Administration','2025-01-15',NULL,'averyhong@example.com','832-123-4567','100 Museum Way','Houston','TX','77004','2026-10-15 20:35:28','2026-10-24 23:41:59',4,1),(2,'John','Smith','Staff','Collections','2025-02-01',NULL,'johnsmith@example.com','713-222-1111','200 Museum Way','Houston','TX','77004','2026-10-15 20:35:28','2026-10-24 23:41:59',4,1),(3,'Random','Dude','Staff','Retail','2025-03-10',NULL,'randomdude@example.com','713-555-0102','300 Museum Way','Houston','TX','77004','2026-10-15 20:35:28','2026-10-24 23:41:59',4,1),(4,'Admin','Demo','Admin','Administration','2026-01-01',NULL,'admin@demo.test','713-555-0103',NULL,NULL,NULL,NULL,'2026-10-17 20:54:32','2026-10-17 20:54:32',4,0),(5,'Supervisor','Demo','Staff','Operations','2026-01-01',NULL,'supervisor@demo.test','713-555-0104',NULL,NULL,NULL,NULL,'2026-10-17 20:54:32','2026-10-21 22:42:53',4,1),(6,'Staff','Demo','Staff','Collections','2026-01-01',NULL,'staff@demo.test','713-555-0105',NULL,NULL,NULL,NULL,'2026-10-17 20:54:32','2026-10-17 20:54:32',4,0),(7,'Operator','Demo','Staff','Visitor Services','2026-01-01',NULL,'operator@demo.test','713-555-0106',NULL,NULL,NULL,NULL,'2026-10-17 20:54:32','2026-10-17 20:54:32',4,1),(9,'Val','Krokhin','Staff','Curatorial','2026-11-05',NULL,'hjgjhgj@gmail.com','1234567890',NULL,NULL,NULL,NULL,'2026-11-05 21:16:28','2026-11-13 00:28:28',4,0),(10,'ooknn','ijjkjn','Staff','Curatorial','2025-09-06','2026-12-09','uihuhbhgv@gmail.com','1111111111',NULL,NULL,NULL,NULL,'2026-11-08 20:47:57','2026-11-08 20:48:24',4,1);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffalert`
--

DROP TABLE IF EXISTS `staffalert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffalert` (
  `AlertID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `StaffID` bigint unsigned NOT NULL,
  `AlertType` varchar(30) NOT NULL,
  `ItemID` bigint unsigned DEFAULT NULL,
  `Message` varchar(255) NOT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'Pending',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ResolvedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`AlertID`),
  KEY `idx_staffalert_staff_status` (`StaffID`,`Status`),
  KEY `idx_staffalert_item` (`ItemID`),
  CONSTRAINT `fk_staffalert_item` FOREIGN KEY (`ItemID`) REFERENCES `giftshop` (`ItemID`),
  CONSTRAINT `fk_staffalert_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `chk_staffalert_status` CHECK ((`Status` in (_utf8mb4'Pending',_utf8mb4'Resolved'))),
  CONSTRAINT `chk_staffalert_type` CHECK ((`AlertType` = _utf8mb4'LowStock'))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffalert`
--

LOCK TABLES `staffalert` WRITE;
/*!40000 ALTER TABLE `staffalert` DISABLE KEYS */;
INSERT INTO `staffalert` VALUES (2,6,'LowStock',6,'Low stock: \"Museum Pins\" has 5 left. Please place an order as soon as possible.','Resolved','2026-10-26 03:53:15','2026-10-26 04:02:41'),(3,6,'LowStock',6,'Low stock: \"Museum Pins\" has 17 left. Please place an order as soon as possible.','Resolved','2026-10-26 04:02:41','2026-11-11 22:47:33'),(4,4,'LowStock',7,'Low stock: \"Museum Keychains\" has 19 left. Please place an order as soon as possible.','Resolved','2026-10-26 05:34:55','2026-11-07 18:59:48'),(5,6,'LowStock',10,'Low stock: \"Museum Puzzles\" has 15 left. Please place an order as soon as possible.','Resolved','2026-11-02 18:18:21','2026-11-02 18:24:40'),(6,4,'LowStock',10,'Low stock: \"Museum Puzzles\" has 12 left. Please place an order as soon as possible.','Resolved','2026-11-05 20:59:37','2026-11-10 20:28:47'),(7,6,'LowStock',7,'Low stock: \"Museum Keychains\" has 13 left. Please place an order as soon as possible.','Resolved','2026-11-07 20:31:33','2026-11-11 22:47:48'),(8,4,'LowStock',8,'Low stock: \"Exhibition Badges\" has 6 left. Please place an order as soon as possible.','Resolved','2026-11-10 19:56:17','2026-11-11 22:48:00'),(9,6,'LowStock',10,'Low stock: \"Museum Puzzles\" has 2 left. Please place an order as soon as possible.','Resolved','2026-11-10 20:36:51','2026-11-12 22:10:24'),(10,4,'LowStock',7,'Low stock: \"Museum Keychains\" has 9 left. Please place an order as soon as possible.','Resolved','2026-11-11 23:02:13','2026-11-12 22:10:10'),(11,4,'LowStock',6,'Low stock: \"Museum Pins\" has 1 left. Please place an order as soon as possible.','Resolved','2026-11-11 23:55:43','2026-11-12 21:40:30'),(12,4,'LowStock',14,'Low stock: \"Museum Wallet\" has 8 left. Please place an order as soon as possible.','Resolved','2026-11-12 16:57:17','2026-11-12 22:10:32'),(13,6,'LowStock',14,'Low stock: \"Museum Wallet\" has 12 left. Please place an order as soon as possible.','Resolved','2026-11-13 06:24:54','2026-11-13 06:49:44'),(14,6,'LowStock',4,'Low stock: \"Postcard Set\" has 17 left. Please place an order as soon as possible.','Resolved','2026-11-13 07:57:02','2026-11-13 08:08:39'),(15,6,'LowStock',5,'Low stock: \"Ceramic Mug\" has 19 left. Please place an order as soon as possible.','Resolved','2026-11-13 08:02:07','2026-11-13 08:08:28'),(16,6,'LowStock',5,'Low stock: \"Ceramic Mug\" has 19 left. Please place an order as soon as possible.','Pending','2026-11-13 08:09:05',NULL);
/*!40000 ALTER TABLE `staffalert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffcredentials`
--

DROP TABLE IF EXISTS `staffcredentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffcredentials` (
  `StaffID` bigint unsigned NOT NULL,
  `Password` varchar(255) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  PRIMARY KEY (`StaffID`),
  CONSTRAINT `fk_staffcredentials_staff` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffcredentials`
--

LOCK TABLES `staffcredentials` WRITE;
/*!40000 ALTER TABLE `staffcredentials` DISABLE KEYS */;
INSERT INTO `staffcredentials` VALUES (4,'admin123','2026-10-17 20:55:44','2026-10-17 20:55:44'),(6,'staff123','2026-10-17 20:55:44','2026-10-17 20:55:44');
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
  `PaymentMethod` varchar(255) DEFAULT NULL,
  `SaleDate` date NOT NULL,
  `VisitDate` date DEFAULT NULL,
  `ExhibitionID` bigint unsigned NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedAt` datetime NOT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `MembershipID` bigint unsigned DEFAULT NULL,
  `CustomerID` bigint unsigned DEFAULT NULL,
  `SchoolEmail` varchar(255) DEFAULT NULL,
  `RefundStatus` varchar(20) NOT NULL DEFAULT 'None',
  `NotificationStatus` varchar(20) NOT NULL DEFAULT 'None',
  PRIMARY KEY (`TicketID`),
  KEY `fk_ticket_exhibition` (`ExhibitionID`),
  KEY `fk_ticket_createdby` (`CreatedBy`),
  KEY `fk_ticket_membership` (`MembershipID`),
  KEY `fk_ticket_customer` (`CustomerID`),
  CONSTRAINT `fk_ticket_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_ticket_customer` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`),
  CONSTRAINT `fk_ticket_exhibition` FOREIGN KEY (`ExhibitionID`) REFERENCES `exhibition` (`ExhibitionID`),
  CONSTRAINT `fk_ticket_membership` FOREIGN KEY (`MembershipID`) REFERENCES `membership` (`MembershipID`),
  CONSTRAINT `chk_ticket_notif` CHECK ((`NotificationStatus` in (_utf8mb4'None',_utf8mb4'Pending',_utf8mb4'Sent'))),
  CONSTRAINT `chk_ticket_price` CHECK ((`Price` > 0)),
  CONSTRAINT `chk_ticket_refund` CHECK ((`RefundStatus` in (_utf8mb4'None',_utf8mb4'Pending',_utf8mb4'Refunded'))),
  CONSTRAINT `chk_ticket_type` CHECK ((`TicketType` in (_utf8mb4'Adult',_utf8mb4'Senior',_utf8mb4'Student',_utf8mb4'Child')))
) ENGINE=InnoDB AUTO_INCREMENT=400 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
INSERT INTO `ticket` VALUES (23,'Adult',24.00,NULL,'2026-10-18',NULL,1,'2026-10-18 20:30:05','2026-10-18 20:30:05',4,0,NULL,NULL,NULL,'None','None'),(24,'Child',20.00,NULL,'2026-10-18',NULL,1,'2026-10-18 20:30:05','2026-10-18 20:30:05',4,0,NULL,NULL,NULL,'None','None'),(25,'Senior',20.00,NULL,'2026-10-18',NULL,1,'2026-10-18 20:30:05','2026-10-18 20:30:05',4,0,NULL,NULL,NULL,'None','None'),(26,'Adult',20.00,NULL,'2026-07-12',NULL,2,'2026-10-19 21:26:59','2026-10-25 00:43:48',4,0,NULL,NULL,NULL,'Refunded','Sent'),(27,'Adult',20.00,NULL,'2026-07-19',NULL,2,'2026-10-19 21:26:59','2026-10-25 00:43:48',4,0,NULL,NULL,NULL,'Refunded','Sent'),(28,'Senior',16.00,NULL,'2026-07-26',NULL,2,'2026-10-19 21:26:59','2026-10-25 00:43:48',4,0,NULL,NULL,NULL,'Refunded','Sent'),(29,'Student',12.00,NULL,'2026-08-02',NULL,2,'2026-10-19 21:26:59','2026-10-25 00:43:48',4,0,NULL,NULL,NULL,'Refunded','Sent'),(30,'Child',8.00,NULL,'2026-08-09',NULL,2,'2026-10-19 21:26:59','2026-10-25 00:43:48',4,0,NULL,NULL,NULL,'Refunded','Sent'),(31,'Adult',20.00,NULL,'2026-08-16',NULL,2,'2026-10-19 21:26:59','2026-10-25 00:43:48',4,0,NULL,NULL,NULL,'Refunded','Sent'),(32,'Adult',5.00,NULL,'2026-08-23',NULL,2,'2026-10-19 21:26:59','2026-10-25 00:43:48',4,0,1,1,NULL,'Refunded','Sent'),(33,'Adult',20.00,NULL,'2026-09-06',NULL,2,'2026-10-19 21:26:59','2026-10-25 00:43:48',4,0,NULL,NULL,NULL,'Refunded','Sent'),(34,'Student',12.00,NULL,'2026-09-13',NULL,2,'2026-10-19 21:26:59','2026-10-25 00:43:48',4,0,NULL,NULL,NULL,'Refunded','Sent'),(35,'Adult',20.00,NULL,'2026-10-04',NULL,2,'2026-10-19 21:26:59','2026-10-25 00:43:48',4,0,NULL,NULL,NULL,'Refunded','Sent'),(36,'Adult',5.00,NULL,'2026-10-11',NULL,2,'2026-10-19 21:26:59','2026-10-25 00:43:48',4,0,2,2,NULL,'Refunded','Sent'),(37,'Adult',20.00,NULL,'2026-08-20',NULL,3,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL,NULL,'None','None'),(38,'Senior',16.00,NULL,'2026-08-30',NULL,3,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL,NULL,'None','None'),(39,'Adult',20.00,NULL,'2026-09-05',NULL,3,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL,NULL,'None','None'),(40,'Child',8.00,NULL,'2026-09-12',NULL,3,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL,NULL,'None','None'),(41,'Student',12.00,NULL,'2026-09-19',NULL,3,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL,NULL,'None','None'),(42,'Adult',5.00,NULL,'2026-09-26',NULL,3,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,3,3,NULL,'None','None'),(43,'Adult',20.00,NULL,'2026-10-03',NULL,3,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL,NULL,'None','None'),(44,'Adult',20.00,NULL,'2026-10-10',NULL,3,'2026-10-19 21:26:59','2026-10-19 21:26:59',4,0,NULL,NULL,NULL,'None','None'),(45,'Adult',20.00,NULL,'2026-09-08',NULL,4,'2026-10-19 21:26:59','2026-10-25 20:36:33',4,0,NULL,NULL,NULL,'Refunded','Sent'),(46,'Student',12.00,NULL,'2026-09-15',NULL,4,'2026-10-19 21:26:59','2026-10-25 20:36:33',4,0,NULL,NULL,NULL,'Refunded','Sent'),(47,'Adult',20.00,NULL,'2026-09-22',NULL,4,'2026-10-19 21:26:59','2026-10-25 20:36:33',4,0,NULL,NULL,NULL,'Refunded','Sent'),(48,'Senior',16.00,NULL,'2026-10-01',NULL,4,'2026-10-19 21:26:59','2026-10-25 20:36:33',4,0,NULL,NULL,NULL,'Refunded','Sent'),(49,'Adult',5.00,NULL,'2026-10-08',NULL,4,'2026-10-19 21:26:59','2026-10-25 20:36:33',4,0,4,4,NULL,'Refunded','Sent'),(50,'Adult',20.00,NULL,'2026-10-15',NULL,4,'2026-10-19 21:26:59','2026-10-25 20:36:33',4,0,NULL,NULL,NULL,'Refunded','Sent'),(51,'Child',8.00,NULL,'2026-10-17',NULL,4,'2026-10-19 21:26:59','2026-10-25 20:36:33',4,0,NULL,NULL,NULL,'Refunded','Sent'),(52,'Adult',5.00,NULL,'2026-10-18',NULL,4,'2026-10-19 21:26:59','2026-10-25 20:36:33',4,0,9,9,NULL,'Refunded','Sent'),(53,'Adult',22.50,'Credit Card','2026-10-22',NULL,2,'2026-10-22 18:47:13','2026-10-25 00:43:48',NULL,0,10,10,NULL,'Refunded','Sent'),(54,'Senior',18.00,'Credit Card','2026-10-22',NULL,2,'2026-10-22 18:47:33','2026-10-25 00:43:48',NULL,0,10,10,NULL,'Refunded','Sent'),(55,'Adult',22.50,'Credit Card','2026-10-23',NULL,2,'2026-10-23 03:36:58','2026-10-25 00:43:48',NULL,0,1,1,NULL,'Refunded','Sent'),(56,'Student',13.50,'Credit Card','2026-10-23',NULL,3,'2026-10-23 03:38:31','2026-10-23 03:38:31',NULL,0,1,1,NULL,'None','None'),(57,'Child',13.50,'Credit Card','2026-10-23',NULL,4,'2026-10-23 03:38:39','2026-10-25 20:36:33',NULL,0,1,1,NULL,'Refunded','Sent'),(70,'Adult',22.50,'Credit Card','2026-10-23',NULL,2,'2026-10-23 16:07:00','2026-10-25 00:43:48',NULL,0,12,11,NULL,'Refunded','Sent'),(71,'Adult',22.50,'Credit Card','2026-10-23',NULL,2,'2026-10-23 16:07:00','2026-10-25 00:43:48',NULL,0,12,11,NULL,'Refunded','Sent'),(72,'Adult',22.50,'Credit Card','2026-10-23',NULL,2,'2026-10-23 16:07:00','2026-10-25 00:43:48',NULL,0,12,11,NULL,'Refunded','Sent'),(73,'Adult',22.50,'Credit Card','2026-10-23',NULL,2,'2026-10-23 16:07:00','2026-10-25 00:43:48',NULL,0,12,11,NULL,'Refunded','Sent'),(74,'Adult',25.00,'Credit Card','2026-10-23',NULL,2,'2026-10-23 19:28:38','2026-10-23 19:31:04',NULL,1,NULL,NULL,NULL,'None','None'),(75,'Adult',22.50,'Credit Card','2026-10-24',NULL,3,'2026-10-24 20:46:30','2026-10-24 20:46:30',NULL,0,12,NULL,NULL,'None','None'),(76,'Adult',22.50,'Credit Card','2026-10-24',NULL,3,'2026-10-24 20:46:30','2026-10-24 20:46:30',NULL,0,12,NULL,NULL,'None','None'),(77,'Adult',25.00,'Credit Card','2026-10-24',NULL,3,'2026-10-24 21:03:33','2026-10-24 21:03:33',NULL,0,NULL,16,NULL,'None','None'),(78,'Adult',25.00,'Credit Card','2026-10-24',NULL,3,'2026-10-24 21:03:33','2026-10-24 21:03:33',NULL,0,NULL,16,NULL,'None','None'),(79,'Adult',25.00,'Credit Card','2026-10-24',NULL,3,'2026-10-24 21:03:33','2026-10-24 21:03:33',NULL,0,NULL,16,NULL,'None','None'),(80,'Adult',25.00,'Credit Card','2026-10-24',NULL,3,'2026-10-24 21:03:33','2026-10-24 21:03:33',NULL,0,NULL,16,NULL,'None','None'),(81,'Adult',22.50,'Credit Card','2026-10-25',NULL,3,'2026-10-25 17:15:46','2026-10-25 17:15:46',NULL,0,18,22,NULL,'None','None'),(82,'Adult',22.50,'Credit Card','2026-10-26','2026-10-26',3,'2026-10-26 10:47:12','2026-10-26 10:47:12',NULL,0,12,11,NULL,'None','None'),(83,'Child',13.50,'Credit Card','2026-10-26','2026-10-26',3,'2026-10-26 10:47:12','2026-10-26 10:47:12',NULL,0,12,11,NULL,'None','None'),(84,'Adult',22.50,'Credit Card','2026-10-26','2026-10-30',3,'2026-10-26 10:52:25','2026-10-26 10:52:25',NULL,0,12,11,NULL,'None','None'),(85,'Adult',22.50,'Credit Card','2026-10-26','2026-10-30',3,'2026-10-26 10:52:25','2026-10-26 10:52:25',NULL,0,12,11,NULL,'None','None'),(86,'Adult',22.50,'Credit Card','2026-10-26','2026-10-30',3,'2026-10-26 10:52:25','2026-10-26 10:52:25',NULL,0,12,11,NULL,'None','None'),(87,'Senior',17.00,'Credit Card','2026-10-26','2026-10-29',3,'2026-10-26 12:03:30','2026-10-26 12:03:30',NULL,0,12,11,NULL,'None','None'),(88,'Senior',20.00,'Credit Card','2026-10-26','2026-10-29',3,'2026-10-26 12:03:30','2026-10-26 12:03:30',NULL,0,12,11,NULL,'None','None'),(89,'Adult',18.75,'Credit Card','2026-10-26','2026-10-26',3,'2026-10-26 15:25:01','2026-10-26 15:25:01',NULL,0,12,11,NULL,'None','None'),(90,'Adult',18.75,'Credit Card','2026-10-26','2026-10-26',3,'2026-10-26 15:25:01','2026-10-26 15:25:01',NULL,0,12,11,NULL,'None','None'),(91,'Adult',25.00,'Credit Card','2026-10-26','2026-10-26',3,'2026-10-26 15:25:01','2026-10-26 15:25:01',NULL,0,12,11,NULL,'None','None'),(92,'Adult',25.00,'Credit Card','2026-10-26','2026-10-26',3,'2026-10-26 15:25:01','2026-10-26 15:25:01',NULL,0,12,11,NULL,'None','None'),(93,'Adult',16.25,'Credit Card','2026-10-26','2026-10-26',3,'2026-10-26 15:25:26','2026-10-26 15:25:26',NULL,0,12,11,NULL,'None','None'),(94,'Adult',16.25,'Credit Card','2026-10-26','2026-10-26',3,'2026-10-26 15:25:26','2026-10-26 15:25:26',NULL,0,12,11,NULL,'None','None'),(95,'Adult',25.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:17:58','2026-11-02 18:17:58',NULL,0,NULL,31,NULL,'None','None'),(96,'Adult',25.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:17:58','2026-11-02 18:17:58',NULL,0,NULL,31,NULL,'None','None'),(97,'Senior',20.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:17:58','2026-11-02 18:17:58',NULL,0,NULL,31,NULL,'None','None'),(98,'Senior',20.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:17:58','2026-11-02 18:17:58',NULL,0,NULL,31,NULL,'None','None'),(99,'Senior',20.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:17:58','2026-11-02 18:17:58',NULL,0,NULL,31,NULL,'None','None'),(100,'Senior',20.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:17:58','2026-11-02 18:17:58',NULL,0,NULL,31,NULL,'None','None'),(101,'Senior',20.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:17:58','2026-11-02 18:17:58',NULL,0,NULL,31,NULL,'None','None'),(102,'Senior',20.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:17:58','2026-11-02 18:17:58',NULL,0,NULL,31,NULL,'None','None'),(103,'Adult',25.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:18:05','2026-11-02 18:18:05',NULL,0,NULL,31,NULL,'None','None'),(104,'Adult',25.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:18:05','2026-11-02 18:18:05',NULL,0,NULL,31,NULL,'None','None'),(105,'Adult',25.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:18:05','2026-11-02 18:18:05',NULL,0,NULL,31,NULL,'None','None'),(106,'Adult',25.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:18:05','2026-11-02 18:18:05',NULL,0,NULL,31,NULL,'None','None'),(107,'Adult',25.00,'Credit Card','2026-11-02','2027-01-15',1,'2026-11-02 18:18:05','2026-11-02 18:18:05',NULL,0,NULL,31,NULL,'None','None'),(108,'Senior',20.00,'Credit Card','2026-11-03','2026-11-03',3,'2026-11-03 06:36:22','2026-11-03 06:36:22',NULL,0,12,11,NULL,'None','None'),(109,'Senior',20.00,'Credit Card','2026-11-03','2026-11-03',8,'2026-11-03 06:38:48','2026-11-03 06:50:05',NULL,0,12,11,NULL,'Refunded','Sent'),(110,'Senior',13.00,'Credit Card','2026-11-03','2026-11-03',3,'2026-11-03 06:57:50','2026-11-03 07:00:28',NULL,0,12,11,NULL,'None','None'),(111,'Adult',25.00,'Credit Card','2026-11-03',NULL,9,'2026-11-03 07:12:53','2026-11-03 07:13:18',NULL,1,NULL,NULL,NULL,'None','None'),(112,'Adult',16.25,'Credit Card','2026-11-03','2026-11-03',9,'2026-11-03 07:14:13','2026-11-03 07:16:25',NULL,1,12,11,NULL,'None','None'),(113,'Adult',18.75,'Credit Card','2026-11-04','2026-11-05',10,'2026-11-04 17:34:48','2026-11-04 17:42:09',NULL,0,12,11,NULL,'Refunded','Sent'),(114,'Adult',18.75,'Credit Card','2026-11-04','2026-11-05',10,'2026-11-04 17:34:48','2026-11-04 17:42:09',NULL,0,12,11,NULL,'Refunded','Sent'),(115,'Adult',25.00,'Credit Card','2026-11-04','2026-11-05',10,'2026-11-04 17:34:48','2026-11-04 17:42:09',NULL,0,12,11,NULL,'Refunded','Sent'),(116,'Adult',18.75,'Credit Card','2026-11-04','2026-11-05',11,'2026-11-04 17:58:25','2026-11-04 18:13:21',NULL,0,25,30,NULL,'Refunded','Sent'),(117,'Adult',18.75,'Credit Card','2026-11-04','2026-11-05',11,'2026-11-04 17:58:25','2026-11-04 18:13:21',NULL,0,25,30,NULL,'Refunded','Sent'),(118,'Adult',25.00,'Credit Card','2026-11-04','2026-11-05',11,'2026-11-04 17:58:25','2026-11-04 18:06:52',NULL,1,25,30,NULL,'None','None'),(119,'Senior',20.00,'Credit Card','2026-11-04','2026-11-05',11,'2026-11-04 18:07:30','2026-11-04 18:13:21',NULL,0,25,30,NULL,'Refunded','Sent'),(120,'Adult',18.75,'Credit Card','2026-11-05','2026-11-04',3,'2026-11-05 01:24:08','2026-11-05 01:24:08',NULL,0,12,11,NULL,'None','None'),(121,'Adult',18.75,'Credit Card','2026-11-05','2026-11-07',3,'2026-11-05 17:30:38','2026-11-05 17:30:38',NULL,0,27,32,NULL,'None','None'),(122,'Adult',18.75,'Credit Card','2026-11-05','2026-11-07',3,'2026-11-05 17:30:38','2026-11-05 17:30:38',NULL,0,27,32,NULL,'None','None'),(123,'Child',11.25,'Credit Card','2026-11-05','2026-11-07',3,'2026-11-05 17:30:38','2026-11-05 17:30:38',NULL,0,27,32,NULL,'None','None'),(124,'Child',11.25,'Credit Card','2026-11-05','2026-11-07',3,'2026-11-05 17:30:38','2026-11-05 17:30:38',NULL,0,27,32,NULL,'None','None'),(125,'Adult',18.75,'Credit Card','2026-11-05','2026-11-05',12,'2026-11-05 18:18:22','2026-11-05 18:19:56',NULL,0,12,11,NULL,'Refunded','Sent'),(126,'Adult',18.75,'Credit Card','2026-11-05','2026-11-05',12,'2026-11-05 18:18:22','2026-11-05 18:19:56',NULL,0,12,11,NULL,'Refunded','Sent'),(127,'Adult',25.00,'Credit Card','2026-11-05','2026-11-05',12,'2026-11-05 18:18:22','2026-11-05 18:19:56',NULL,0,12,11,NULL,'Refunded','Sent'),(128,'Adult',25.00,'Credit Card','2026-11-05','2026-11-05',12,'2026-11-05 18:18:22','2026-11-05 18:19:56',NULL,0,12,11,NULL,'Refunded','Sent'),(129,'Adult',25.00,'Credit Card','2026-11-05','2026-11-05',12,'2026-11-05 18:18:22','2026-11-05 18:19:56',NULL,0,12,11,NULL,'Refunded','Sent'),(130,'Adult',18.75,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-08 21:18:07',NULL,1,12,11,NULL,'None','None'),(131,'Adult',18.75,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(132,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(133,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(134,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(135,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(136,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(137,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(138,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(139,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(140,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(141,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:02','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(142,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(143,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(144,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(145,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(146,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(147,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(148,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(149,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(150,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(151,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(152,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(153,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(154,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(155,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(156,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:03','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(157,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(158,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(159,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(160,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(161,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(162,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(163,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(164,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(165,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(166,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(167,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(168,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(169,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(170,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(171,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:04','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(172,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(173,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(174,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(175,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(176,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(177,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(178,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(179,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(180,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(181,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(182,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(183,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(184,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(185,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(186,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(187,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:05','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(188,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(189,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(190,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(191,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(192,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(193,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(194,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(195,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(196,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(197,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(198,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(199,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(200,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(201,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:06','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(202,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(203,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(204,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(205,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(206,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(207,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(208,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(209,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(210,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(211,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(212,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(213,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(214,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(215,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(216,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:07','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(217,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(218,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(219,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(220,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(221,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(222,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(223,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(224,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(225,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(226,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(227,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(228,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(229,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(230,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(231,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(232,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:08','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(233,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(234,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(235,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(236,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(237,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(238,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(239,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(240,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(241,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(242,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(243,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(244,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(245,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(246,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(247,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:09','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(248,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(249,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(250,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(251,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(252,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(253,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(254,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(255,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(256,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(257,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(258,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(259,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(260,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(261,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(262,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(263,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:10','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(264,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(265,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(266,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(267,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(268,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(269,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(270,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(271,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(272,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(273,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(274,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(275,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(276,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(277,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(278,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:11','2026-11-10 19:53:20',NULL,0,12,11,NULL,'Refunded','Sent'),(279,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',13,'2026-11-05 19:19:12','2026-11-10 00:10:53',NULL,1,12,11,NULL,'None','None'),(280,'Adult',25.00,'Credit Card','2026-11-05','2026-11-09',3,'2026-11-05 20:52:02','2026-11-05 20:52:02',NULL,0,NULL,35,NULL,'None','None'),(281,'Adult',25.00,'Credit Card','2026-11-05','2026-11-05',14,'2026-11-05 20:55:34','2026-11-05 20:56:31',NULL,0,NULL,35,NULL,'Refunded','Sent'),(282,'Adult',25.00,'Credit Card','2026-11-05','2026-11-05',14,'2026-11-05 20:55:34','2026-11-05 20:56:31',NULL,0,NULL,35,NULL,'Refunded','Sent'),(283,'Adult',25.00,'Credit Card','2026-11-05','2026-11-05',14,'2026-11-05 20:55:34','2026-11-05 20:56:31',NULL,0,NULL,35,NULL,'Refunded','Sent'),(284,'Adult',18.75,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:01:33','2026-11-05 21:01:33',NULL,0,28,35,NULL,'None','None'),(285,'Adult',18.75,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:01:33','2026-11-05 21:01:33',NULL,0,28,35,NULL,'None','None'),(286,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:01:33','2026-11-05 21:01:33',NULL,0,28,35,NULL,'None','None'),(287,'Child',11.25,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:01:33','2026-11-05 21:01:33',NULL,0,28,35,NULL,'None','None'),(288,'Child',11.25,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:01:33','2026-11-05 21:01:33',NULL,0,28,35,NULL,'None','None'),(289,'Child',15.00,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:01:33','2026-11-05 21:01:33',NULL,0,28,35,NULL,'None','None'),(290,'Senior',20.00,'Credit Card','2026-11-05','2026-11-05',15,'2026-11-05 21:26:23','2026-11-05 21:28:57',NULL,0,28,35,NULL,'Refunded','Sent'),(291,'Senior',20.00,'Credit Card','2026-11-05','2026-11-05',15,'2026-11-05 21:26:23','2026-11-05 21:28:57',NULL,0,28,35,NULL,'Refunded','Sent'),(292,'Adult',18.75,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:32:21','2026-11-05 21:32:21',NULL,0,28,35,NULL,'None','None'),(293,'Adult',18.75,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:32:21','2026-11-05 21:32:21',NULL,0,28,35,NULL,'None','None'),(294,'Adult',25.00,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:32:21','2026-11-05 21:32:21',NULL,0,28,35,NULL,'None','None'),(295,'Child',11.25,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:32:21','2026-11-05 21:32:21',NULL,0,28,35,NULL,'None','None'),(296,'Child',11.25,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:32:21','2026-11-05 21:32:21',NULL,0,28,35,NULL,'None','None'),(297,'Child',15.00,'Credit Card','2026-11-05','2026-11-06',3,'2026-11-05 21:32:21','2026-11-05 21:32:21',NULL,0,28,35,NULL,'None','None'),(298,'Adult',18.75,'Credit Card','2026-11-07','2027-01-15',1,'2026-11-07 19:40:57','2026-11-07 19:40:57',NULL,0,28,35,NULL,'None','None'),(299,'Adult',18.75,'Credit Card','2026-11-07','2027-01-15',1,'2026-11-07 19:40:57','2026-11-07 19:40:57',NULL,0,28,35,NULL,'None','None'),(300,'Adult',25.00,'Credit Card','2026-11-07','2026-11-08',16,'2026-11-07 20:04:23','2026-11-07 20:05:58',NULL,0,NULL,36,NULL,'Refunded','Sent'),(301,'Adult',25.00,'Credit Card','2026-11-07','2026-11-08',16,'2026-11-07 20:04:23','2026-11-08 17:26:46',NULL,1,NULL,36,NULL,'Refunded','Sent'),(302,'Adult',18.75,'Credit Card','2026-11-07','2026-11-07',3,'2026-11-07 20:13:43','2026-11-07 20:13:43',NULL,0,29,36,NULL,'None','None'),(303,'Adult',18.75,'Credit Card','2026-11-07','2026-11-07',3,'2026-11-07 20:13:43','2026-11-07 20:13:43',NULL,0,29,36,NULL,'None','None'),(304,'Adult',25.00,'Credit Card','2026-11-07','2026-11-07',3,'2026-11-07 20:13:43','2026-11-07 20:13:43',NULL,0,29,36,NULL,'None','None'),(305,'Child',11.25,'Credit Card','2026-11-07','2026-11-07',3,'2026-11-07 20:13:43','2026-11-07 20:13:43',NULL,0,29,36,NULL,'None','None'),(306,'Child',11.25,'Credit Card','2026-11-07','2026-11-07',3,'2026-11-07 20:13:43','2026-11-07 20:13:43',NULL,0,29,36,NULL,'None','None'),(307,'Child',15.00,'Credit Card','2026-11-07','2026-11-07',3,'2026-11-07 20:13:43','2026-11-07 20:13:43',NULL,0,29,36,NULL,'None','None'),(308,'Adult',18.75,'Credit Card','2026-11-08','2027-01-15',1,'2026-11-08 20:51:52','2026-11-08 20:52:32',NULL,1,12,11,NULL,'None','None'),(309,'Adult',25.00,'Credit Card','2026-11-09','2026-11-09',17,'2026-11-09 22:55:14','2026-11-09 22:55:14',NULL,0,NULL,39,NULL,'None','None'),(310,'Adult',25.00,'Credit Card','2026-11-10','2026-11-10',13,'2026-11-10 19:51:46','2026-11-10 19:53:20',NULL,0,NULL,40,NULL,'Refunded','Sent'),(311,'Adult',25.00,'Credit Card','2026-11-10','2026-11-10',13,'2026-11-10 19:51:46','2026-11-10 19:53:20',NULL,0,NULL,40,NULL,'Refunded','Sent'),(312,'Adult',25.00,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 19:53:52','2026-11-10 19:54:06',NULL,1,NULL,40,NULL,'None','None'),(313,'Adult',18.75,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:00:38','2026-11-10 20:00:38',NULL,0,32,40,NULL,'None','None'),(314,'Adult',18.75,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:00:38','2026-11-10 20:00:38',NULL,0,32,40,NULL,'None','None'),(315,'Adult',25.00,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:00:38','2026-11-10 20:00:38',NULL,0,32,40,NULL,'None','None'),(316,'Child',11.25,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:00:38','2026-11-10 20:00:38',NULL,0,32,40,NULL,'None','None'),(317,'Child',11.25,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:00:38','2026-11-10 20:00:38',NULL,0,32,40,NULL,'None','None'),(318,'Child',15.00,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:00:38','2026-11-10 20:00:38',NULL,0,32,40,NULL,'None','None'),(319,'Adult',25.00,'Credit Card','2026-11-10','2026-11-10',18,'2026-11-10 20:32:24','2026-11-10 20:34:21',NULL,0,NULL,41,NULL,'Refunded','Sent'),(320,'Adult',25.00,'Credit Card','2026-11-10','2026-11-10',18,'2026-11-10 20:32:24','2026-11-10 20:34:21',NULL,0,NULL,41,NULL,'Refunded','Sent'),(321,'Adult',25.00,'Credit Card','2026-11-10','2026-11-10',18,'2026-11-10 20:32:24','2026-11-10 20:34:21',NULL,0,NULL,41,NULL,'Refunded','Sent'),(322,'Adult',25.00,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:34:50','2026-11-10 20:35:07',NULL,1,NULL,41,NULL,'None','None'),(323,'Adult',18.75,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:39:09','2026-11-10 20:39:09',NULL,0,33,41,NULL,'None','None'),(324,'Adult',18.75,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:39:09','2026-11-10 20:39:09',NULL,0,33,41,NULL,'None','None'),(325,'Adult',25.00,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:39:09','2026-11-10 20:39:09',NULL,0,33,41,NULL,'None','None'),(326,'Child',11.25,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:39:09','2026-11-10 20:39:09',NULL,0,33,41,NULL,'None','None'),(327,'Child',11.25,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:39:09','2026-11-10 20:39:09',NULL,0,33,41,NULL,'None','None'),(328,'Child',15.00,'Credit Card','2026-11-10','2026-11-10',3,'2026-11-10 20:39:09','2026-11-10 20:39:09',NULL,0,33,41,NULL,'None','None'),(329,'Adult',18.75,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 22:21:50','2026-11-11 22:21:50',NULL,0,12,11,NULL,'None','None'),(330,'Adult',18.75,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 22:21:50','2026-11-11 22:21:50',NULL,0,12,11,NULL,'None','None'),(331,'Adult',25.00,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 22:21:50','2026-11-11 22:21:50',NULL,0,12,11,NULL,'None','None'),(332,'Child',11.25,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 22:21:50','2026-11-11 22:21:50',NULL,0,12,11,NULL,'None','None'),(333,'Child',11.25,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 22:21:50','2026-11-11 22:21:50',NULL,0,12,11,NULL,'None','None'),(334,'Child',15.00,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 22:21:50','2026-11-11 22:21:50',NULL,0,12,11,NULL,'None','None'),(335,'Adult',25.00,'Credit Card','2026-11-11','2026-11-13',19,'2026-11-11 22:57:33','2026-11-11 22:59:33',NULL,0,NULL,42,NULL,'Refunded','Sent'),(336,'Adult',25.00,'Credit Card','2026-11-11','2026-11-13',19,'2026-11-11 22:57:33','2026-11-11 22:59:33',NULL,0,NULL,42,NULL,'Refunded','Sent'),(337,'Adult',25.00,'Credit Card','2026-11-11','2026-11-13',19,'2026-11-11 22:57:33','2026-11-11 22:59:33',NULL,0,NULL,42,NULL,'Refunded','Sent'),(338,'Adult',25.00,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:00:04','2026-11-11 23:00:24',NULL,1,NULL,42,NULL,'None','None'),(339,'Adult',18.75,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:03:50','2026-11-11 23:03:50',NULL,0,34,42,NULL,'None','None'),(340,'Adult',18.75,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:03:50','2026-11-11 23:03:50',NULL,0,34,42,NULL,'None','None'),(341,'Adult',25.00,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:03:50','2026-11-11 23:03:50',NULL,0,34,42,NULL,'None','None'),(342,'Child',11.25,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:03:50','2026-11-11 23:03:50',NULL,0,34,42,NULL,'None','None'),(343,'Child',11.25,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:03:50','2026-11-11 23:03:50',NULL,0,34,42,NULL,'None','None'),(344,'Child',15.00,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:03:50','2026-11-11 23:03:50',NULL,0,34,42,NULL,'None','None'),(345,'Adult',25.00,'Credit Card','2026-11-11','2026-11-11',20,'2026-11-11 23:48:39','2026-11-11 23:51:20',NULL,0,NULL,43,NULL,'Refunded','Sent'),(346,'Adult',25.00,'Credit Card','2026-11-11','2026-11-11',20,'2026-11-11 23:48:39','2026-11-11 23:51:20',NULL,0,NULL,43,NULL,'Refunded','Sent'),(347,'Adult',25.00,'Credit Card','2026-11-11','2026-11-11',20,'2026-11-11 23:48:39','2026-11-11 23:51:20',NULL,0,NULL,43,NULL,'Refunded','Sent'),(348,'Adult',25.00,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:51:59','2026-11-11 23:52:14',NULL,1,NULL,43,NULL,'None','None'),(349,'Adult',18.75,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:58:30','2026-11-11 23:58:30',NULL,0,35,43,NULL,'None','None'),(350,'Adult',18.75,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:58:30','2026-11-11 23:58:30',NULL,0,35,43,NULL,'None','None'),(351,'Adult',25.00,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:58:30','2026-11-11 23:58:30',NULL,0,35,43,NULL,'None','None'),(352,'Child',11.25,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:58:30','2026-11-11 23:58:30',NULL,0,35,43,NULL,'None','None'),(353,'Child',11.25,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:58:30','2026-11-11 23:58:30',NULL,0,35,43,NULL,'None','None'),(354,'Child',15.00,'Credit Card','2026-11-11','2026-11-11',3,'2026-11-11 23:58:30','2026-11-11 23:58:30',NULL,0,35,43,NULL,'None','None'),(355,'Adult',18.75,'Credit Card','2026-11-12','2026-11-12',23,'2026-11-12 22:57:18','2026-11-12 22:59:19',NULL,0,12,11,NULL,'Refunded','Sent'),(356,'Adult',18.75,'Credit Card','2026-11-12','2026-11-12',23,'2026-11-12 22:57:18','2026-11-12 22:59:19',NULL,0,12,11,NULL,'Refunded','Sent'),(357,'Adult',18.75,'Credit Card','2026-11-13','2026-11-12',3,'2026-11-13 00:14:56','2026-11-13 00:14:56',NULL,0,12,11,NULL,'None','None'),(358,'Adult',18.75,NULL,'2026-11-13','2026-11-13',24,'2026-11-13 06:32:30','2026-11-13 06:34:42',NULL,0,12,11,NULL,'Refunded','Sent'),(359,'Adult',18.75,NULL,'2026-11-13','2026-11-13',24,'2026-11-13 06:32:30','2026-11-13 06:34:42',NULL,0,12,11,NULL,'Refunded','Sent'),(360,'Adult',25.00,NULL,'2026-11-13','2026-11-13',24,'2026-11-13 06:32:30','2026-11-13 06:34:42',NULL,0,12,11,NULL,'Refunded','Sent'),(361,'Adult',25.00,NULL,'2026-11-13','2026-11-13',24,'2026-11-13 06:32:31','2026-11-13 06:34:42',NULL,0,12,11,NULL,'Refunded','Sent'),(362,'Adult',18.75,NULL,'2026-11-13','2026-11-13',25,'2026-11-13 06:39:10','2026-11-13 06:43:29',NULL,0,12,11,NULL,'Refunded','Sent'),(363,'Adult',18.75,NULL,'2026-11-13','2026-11-13',25,'2026-11-13 06:39:10','2026-11-13 06:43:29',NULL,0,12,11,NULL,'Refunded','Sent'),(364,'Adult',18.75,NULL,'2026-11-13','2026-11-13',26,'2026-11-13 06:59:24','2026-11-13 07:08:43',NULL,0,35,43,NULL,'Refunded','Sent'),(365,'Adult',18.75,NULL,'2026-11-13','2026-11-13',26,'2026-11-13 06:59:24','2026-11-13 07:08:43',NULL,0,35,43,NULL,'Refunded','Sent'),(366,'Adult',18.75,NULL,'2026-11-13','2026-11-13',27,'2026-11-13 07:13:50','2026-11-13 07:14:30',NULL,0,35,43,NULL,'Refunded','Sent'),(367,'Adult',18.75,NULL,'2026-11-13','2026-11-13',27,'2026-11-13 07:13:50','2026-11-13 07:14:30',NULL,0,35,43,NULL,'Refunded','Sent'),(368,'Adult',18.75,NULL,'2026-11-13','2026-11-13',28,'2026-11-13 07:26:10','2026-11-13 07:26:39',NULL,0,35,43,NULL,'Refunded','Sent'),(369,'Adult',18.75,NULL,'2026-11-13','2026-11-13',29,'2026-11-13 08:18:28','2026-11-13 08:18:59',NULL,0,35,43,NULL,'Refunded','Sent'),(370,'Adult',18.75,NULL,'2026-11-13','2026-11-13',30,'2026-11-13 08:21:10','2026-11-13 08:22:24',NULL,0,35,43,NULL,'Refunded','Sent'),(371,'Adult',18.75,NULL,'2026-11-13','2026-11-13',30,'2026-11-13 08:21:10','2026-11-13 08:22:24',NULL,0,35,43,NULL,'Refunded','Sent'),(372,'Adult',18.75,'Credit Card','2026-11-13','2027-01-15',1,'2026-11-13 23:22:31','2026-11-13 23:22:31',NULL,0,12,11,NULL,'None','None'),(373,'Adult',18.75,'Credit Card','2026-11-13','2027-01-15',1,'2026-11-13 23:22:45','2026-11-13 23:22:45',NULL,0,12,11,NULL,'None','None'),(374,'Student',15.00,'Credit Card','2026-11-13','2026-11-14',31,'2026-11-13 23:31:29','2026-11-14 03:09:20',NULL,0,12,11,NULL,'Refunded','Sent'),(375,'Adult',18.75,'Credit Card','2026-11-13','2026-11-14',31,'2026-11-13 23:31:29','2026-11-13 23:32:56',NULL,1,12,11,NULL,'None','None'),(376,'Adult',18.75,'Credit Card','2026-11-14','2026-11-30',32,'2026-11-14 00:33:58','2026-11-14 00:35:02',NULL,0,12,11,NULL,'Refunded','Sent'),(377,'Adult',18.75,'Credit Card','2026-11-14','2026-11-14',33,'2026-11-14 00:38:05','2026-11-14 00:43:09',NULL,0,12,11,NULL,'Refunded','Sent'),(378,'Adult',18.75,'Credit Card','2026-11-14','2026-11-14',34,'2026-11-14 00:50:02','2026-11-14 00:50:33',NULL,0,12,11,NULL,'Refunded','Sent'),(379,'Adult',18.75,'Credit Card','2026-11-14','2026-11-14',35,'2026-11-14 00:53:54','2026-11-14 00:53:54',NULL,0,12,11,NULL,'None','None'),(380,'Adult',18.75,'Credit Card','2026-11-14','2026-11-14',35,'2026-11-14 00:53:54','2026-11-14 03:08:06',NULL,1,12,11,NULL,'None','None'),(381,'Adult',25.00,'Credit Card','2026-11-14','2026-11-14',36,'2026-11-14 00:55:41','2026-11-14 00:58:14',NULL,0,12,11,NULL,'Refunded','Sent'),(382,'Adult',25.00,'Credit Card','2026-11-14','2026-11-14',36,'2026-11-14 00:55:41','2026-11-14 00:58:14',NULL,0,12,11,NULL,'Refunded','Sent'),(383,'Student',15.00,'Credit Card','2026-11-14','2026-11-13',3,'2026-11-14 01:15:37','2026-11-14 01:15:37',NULL,0,12,11,'vkrokhot@cougarnet.uh.edu','None','None'),(384,'Student',15.00,'Credit Card','2026-11-14','2026-11-14',3,'2026-11-14 01:16:24','2026-11-14 01:16:24',NULL,0,12,11,'vkrokhot@cougarnet.uh.edu','None','None'),(385,'Adult',18.75,'Debit Card','2026-11-14','2026-11-13',3,'2026-11-14 03:33:54','2026-11-14 03:33:54',NULL,0,12,11,NULL,'None','None'),(386,'Adult',18.75,'Debit Card','2026-11-14','2026-11-13',3,'2026-11-14 03:33:54','2026-11-14 03:33:54',NULL,0,12,11,NULL,'None','None'),(387,'Adult',25.00,'Debit Card','2026-11-14','2026-11-13',3,'2026-11-14 03:33:54','2026-11-14 03:33:54',NULL,0,12,11,NULL,'None','None'),(388,'Adult',18.75,'Credit Card','2026-11-14','2026-12-01',37,'2026-11-14 04:49:01','2026-11-14 04:49:50',NULL,1,12,11,NULL,'None','None'),(389,'Adult',18.75,'Credit Card','2026-11-14','2026-12-01',37,'2026-11-14 04:49:01','2026-11-14 04:49:50',NULL,1,12,11,NULL,'None','None'),(390,'Adult',25.00,'Credit Card','2026-11-14','2026-12-01',37,'2026-11-14 04:49:01','2026-11-14 04:49:49',NULL,1,12,11,NULL,'None','None'),(391,'Adult',18.75,'Credit Card','2026-11-14','2026-12-02',37,'2026-11-14 04:49:39','2026-11-14 04:49:49',NULL,1,12,11,NULL,'None','None'),(392,'Adult',18.75,'Credit Card','2026-11-14','2026-12-01',37,'2026-11-14 05:03:37','2026-11-14 05:03:58',NULL,1,12,11,NULL,'None','None'),(393,'Adult',18.75,'Credit Card','2026-11-14','2026-12-01',37,'2026-11-14 05:03:37','2026-11-14 05:03:58',NULL,1,12,11,NULL,'None','None'),(394,'Adult',25.00,'Credit Card','2026-11-14','2026-11-13',3,'2026-11-14 05:04:13','2026-11-14 05:04:13',NULL,0,12,11,NULL,'None','None'),(395,'Adult',25.00,'Credit Card','2026-11-14','2026-11-13',3,'2026-11-14 05:04:13','2026-11-14 05:04:13',NULL,0,12,11,NULL,'None','None'),(396,'Adult',25.00,'Credit Card','2026-11-14','2026-11-13',3,'2026-11-14 05:04:29','2026-11-14 05:04:29',NULL,0,12,11,NULL,'None','None'),(397,'Adult',25.00,'Credit Card','2026-11-14','2026-11-13',3,'2026-11-14 05:04:29','2026-11-14 05:04:29',NULL,0,12,11,NULL,'None','None'),(398,'Adult',18.75,'Credit Card','2026-11-14','2026-12-01',37,'2026-11-14 05:15:29','2026-11-14 05:15:29',NULL,0,12,11,NULL,'None','None'),(399,'Adult',18.75,'Credit Card','2026-11-14','2026-12-01',37,'2026-11-14 05:15:29','2026-11-14 05:15:29',NULL,0,12,11,NULL,'None','None');
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`Team3`@`%`*/ /*!50003 TRIGGER `trg_ticket_before_insert` BEFORE INSERT ON `ticket` FOR EACH ROW BEGIN
    IF EXISTS (
        SELECT 1
        FROM exhibition
        WHERE ExhibitionID = NEW.ExhibitionID
          AND (IsDeleted = 1 OR CancelledAt IS NOT NULL)
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Exhibition is not open for ticket sales';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM exhibition
        WHERE ExhibitionID = NEW.ExhibitionID
          AND EndDate < NEW.SaleDate
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Exhibition has already ended';
    END IF;

    IF NEW.VisitDate IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM exhibition
        WHERE ExhibitionID = NEW.ExhibitionID
          AND IsDeleted = 0
          AND CancelledAt IS NULL
          AND StartDate <= NEW.VisitDate
          AND EndDate >= NEW.VisitDate
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Visit date must be within the exhibition dates';
    END IF;

    IF (
        SELECT COUNT(*)
        FROM ticket
        WHERE ExhibitionID = NEW.ExhibitionID
          AND VisitDate <=> NEW.VisitDate
          AND IsDeleted = 0
          AND RefundStatus <> 'Refunded'
    ) >= (
        SELECT Capacity
        FROM exhibition
        WHERE ExhibitionID = NEW.ExhibitionID
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Exhibition ticket capacity exceeded for that visit date';
    END IF;

    IF NEW.MembershipID IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM membership m
        JOIN membershipterm t
          ON t.MembershipID = m.MembershipID
        WHERE m.MembershipID = NEW.MembershipID
          AND m.IsDeleted = 0
          AND t.CancelledAt IS NULL
          AND NEW.SaleDate BETWEEN t.StartDate AND t.EndDate
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Membership is not active on the sale date';
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
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`Team3`@`%`*/ /*!50003 TRIGGER `trg_ticket_before_update` BEFORE UPDATE ON `ticket` FOR EACH ROW BEGIN
    IF NEW.IsDeleted = 0
       AND NEW.RefundStatus <> 'Refunded'
       AND (
            OLD.IsDeleted = 1
            OR OLD.RefundStatus = 'Refunded'
            OR NEW.ExhibitionID <> OLD.ExhibitionID
            OR NOT (NEW.VisitDate <=> OLD.VisitDate)
       ) THEN

        IF EXISTS (
            SELECT 1
            FROM exhibition
            WHERE ExhibitionID = NEW.ExhibitionID
              AND CancelledAt IS NOT NULL
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Exhibition is not open for ticket sales';
        END IF;

        IF (
            SELECT COUNT(*)
            FROM ticket
            WHERE ExhibitionID = NEW.ExhibitionID
              AND VisitDate <=> NEW.VisitDate
              AND IsDeleted = 0
              AND RefundStatus <> 'Refunded'
              AND TicketID <> NEW.TicketID
        ) >= (
            SELECT Capacity
            FROM exhibition
            WHERE ExhibitionID = NEW.ExhibitionID
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Exhibition ticket capacity exceeded for that visit date';
        END IF;
    END IF;

    IF NEW.VisitDate IS NOT NULL
       AND (NOT (NEW.VisitDate <=> OLD.VisitDate)
            OR NEW.ExhibitionID <> OLD.ExhibitionID)
       AND NOT EXISTS (
           SELECT 1 FROM exhibition
           WHERE ExhibitionID = NEW.ExhibitionID
             AND IsDeleted = 0
             AND CancelledAt IS NULL
             AND StartDate <= NEW.VisitDate
             AND EndDate >= NEW.VisitDate
       ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Visit date must be within the exhibition dates';
    END IF;

    IF NEW.MembershipID IS NOT NULL
       AND NOT (NEW.MembershipID <=> OLD.MembershipID)
       AND NOT EXISTS (
           SELECT 1
           FROM membership m
           JOIN membershipterm t
             ON t.MembershipID = m.MembershipID
           WHERE m.MembershipID = NEW.MembershipID
             AND m.IsDeleted = 0
             AND t.CancelledAt IS NULL
             AND NEW.SaleDate BETWEEN t.StartDate AND t.EndDate
       ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Membership is not active on the sale date';
    END IF;

    IF NEW.RefundStatus <> OLD.RefundStatus THEN
        IF NOT (
            (OLD.RefundStatus = 'None'
             AND NEW.RefundStatus = 'Pending')
            OR
            (OLD.RefundStatus = 'Pending'
             AND NEW.RefundStatus = 'Refunded')
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Invalid refund status change';
        END IF;

        IF NEW.RefundStatus = 'Pending'
           AND (
               SELECT CancelledAt
               FROM exhibition
               WHERE ExhibitionID = NEW.ExhibitionID
           ) IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Refunds are only for cancelled exhibitions';
        END IF;
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
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`Team3`@`%`*/ /*!50003 TRIGGER `trg_ticket_free_seat` AFTER UPDATE ON `ticket` FOR EACH ROW BEGIN
  IF (OLD.RefundStatus <> 'Refunded' AND NEW.RefundStatus = 'Refunded')
     OR (OLD.IsDeleted = 0 AND NEW.IsDeleted = 1) THEN
    UPDATE waitlist
    SET Status = 'Notified',
        NotifiedAt = NOW()
    WHERE ExhibitionID = NEW.ExhibitionID
      AND Status = 'Waiting'
      AND (SELECT CancelledAt FROM exhibition WHERE ExhibitionID = NEW.ExhibitionID) IS NULL
    ORDER BY WaitlistID
    LIMIT 1;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ticketprice`
--

DROP TABLE IF EXISTS `ticketprice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticketprice` (
  `TicketType` varchar(255) NOT NULL,
  `Price` decimal(8,2) NOT NULL,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`TicketType`),
  CONSTRAINT `chk_ticketprice_price` CHECK ((`Price` > 0)),
  CONSTRAINT `chk_ticketprice_type` CHECK ((`TicketType` in (_utf8mb4'Adult',_utf8mb4'Senior',_utf8mb4'Student',_utf8mb4'Child')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticketprice`
--

LOCK TABLES `ticketprice` WRITE;
/*!40000 ALTER TABLE `ticketprice` DISABLE KEYS */;
INSERT INTO `ticketprice` VALUES ('Adult',25.00,'2026-11-03 19:56:09'),('Child',15.00,'2026-11-03 19:56:09'),('Senior',20.00,'2026-11-03 19:56:09'),('Student',15.00,'2026-11-03 19:56:09');
/*!40000 ALTER TABLE `ticketprice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waitlist`
--

DROP TABLE IF EXISTS `waitlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waitlist` (
  `WaitlistID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ExhibitionID` bigint unsigned NOT NULL,
  `CustomerID` bigint unsigned NOT NULL,
  `TicketType` varchar(255) NOT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'Waiting',
  `CreatedAt` datetime NOT NULL,
  `NotifiedAt` datetime DEFAULT NULL,
  `CreatedBy` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`WaitlistID`),
  KEY `fk_waitlist_exhibition` (`ExhibitionID`),
  KEY `fk_waitlist_createdby` (`CreatedBy`),
  KEY `fk_waitlist_customer` (`CustomerID`),
  CONSTRAINT `fk_waitlist_createdby` FOREIGN KEY (`CreatedBy`) REFERENCES `staff` (`StaffID`),
  CONSTRAINT `fk_waitlist_customer` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`),
  CONSTRAINT `fk_waitlist_exhibition` FOREIGN KEY (`ExhibitionID`) REFERENCES `exhibition` (`ExhibitionID`),
  CONSTRAINT `chk_waitlist_status` CHECK ((`Status` in (_utf8mb3'Waiting',_utf8mb3'Notified',_utf8mb3'Claimed',_utf8mb3'Cancelled')))
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waitlist`
--

LOCK TABLES `waitlist` WRITE;
/*!40000 ALTER TABLE `waitlist` DISABLE KEYS */;
INSERT INTO `waitlist` VALUES (1,9,11,'Adult','Cancelled','2026-11-03 06:58:03',NULL,NULL),(2,9,11,'Adult','Claimed','2026-11-03 06:58:17','2026-11-03 07:13:18',NULL),(3,9,11,'Adult','Cancelled','2026-11-03 07:16:03','2026-11-03 07:16:25',NULL),(4,11,30,'Adult','Claimed','2026-11-04 18:00:31','2026-11-04 18:06:52',NULL),(5,12,11,'Adult','Cancelled','2026-11-05 18:18:37',NULL,NULL),(6,12,11,'Adult','Cancelled','2026-11-05 18:19:09',NULL,NULL),(7,13,37,'Adult','Cancelled','2026-11-08 21:10:26','2026-11-08 21:18:07',NULL),(8,18,41,'Senior','Cancelled','2026-11-10 20:32:32',NULL,NULL),(9,19,42,'Senior','Cancelled','2026-11-11 22:57:43',NULL,NULL),(10,20,43,'Senior','Cancelled','2026-11-11 23:48:51',NULL,NULL),(11,24,11,'Adult','Cancelled','2026-11-13 06:32:35',NULL,NULL),(12,25,43,'Adult','Cancelled','2026-11-13 06:39:45',NULL,NULL),(13,31,11,'Adult','Cancelled','2026-11-13 23:31:36','2026-11-13 23:32:56',NULL);
/*!40000 ALTER TABLE `waitlist` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`Team3`@`%`*/ /*!50003 TRIGGER `trg_waitlist_before_insert` BEFORE INSERT ON `waitlist` FOR EACH ROW BEGIN
  IF (SELECT COUNT(*)
      FROM waitlist
      WHERE ExhibitionID = NEW.ExhibitionID
        AND Status IN ('Waiting', 'Notified')) >= 10 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The waitlist for this exhibition is full';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping events for database 'museum'
--

--
-- Dumping routines for database 'museum'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-13 23:25:02
