-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: flight_booking
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `airports`
--

DROP TABLE IF EXISTS `airports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `airports` (
  `code` varchar(10) NOT NULL,
  `city` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airports`
--

LOCK TABLES `airports` WRITE;
/*!40000 ALTER TABLE `airports` DISABLE KEYS */;
INSERT INTO `airports` VALUES ('BKK','Bangkok','Suvarnabhumi Airport'),('CDG','Paris','Charles de Gaulle'),('DAC','Dhaka','Hazrat Shahjalal International'),('DXB','Dubai','Dubai International'),('FRA','Frankfurt','Frankfurt Airport'),('HND','Tokyo','Haneda'),('IST','Istanbul','Istanbul Airport'),('JFK','New York','John F. Kennedy International'),('LHR','London','Heathrow'),('PEK','Beijing','Beijing Capital International'),('PVG','Shanghai','Shanghai Pudong International'),('SIN','Singapore','Changi'),('SYD','Sydney','Sydney Airport');
/*!40000 ALTER TABLE `airports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `flight_id` int(11) DEFAULT NULL,
  `seat` varchar(10) DEFAULT NULL,
  `seat_number` varchar(10) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'confirmed',
  `reminder_sent` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `flight_id` (`flight_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`flight_id`) REFERENCES `flights` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (39,2,11,NULL,'11E','confirmed',0),(40,2,20,NULL,'11E','confirmed',0),(41,2,2,NULL,'8D','confirmed',0),(42,2,15,NULL,'2E','confirmed',0),(43,2,20,NULL,'2E','confirmed',0),(45,2,3,NULL,'10E','confirmed',0),(47,1,19,NULL,'12D','confirmed',0),(48,1,54,NULL,'12D','confirmed',0),(49,1,19,NULL,'7F','confirmed',0),(50,1,54,NULL,'7F','confirmed',0),(51,1,16,NULL,'4F','confirmed',0),(52,2,52,NULL,'2F','confirmed',0),(53,2,24,NULL,'5F','confirmed',0),(54,2,11,NULL,'6F','confirmed',0),(55,2,20,NULL,'6F','confirmed',0),(56,2,164,NULL,'13F','confirmed',0),(57,2,114,NULL,'1F','confirmed',0),(58,2,116,NULL,'1F','confirmed',0);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flights`
--

DROP TABLE IF EXISTS `flights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `flights` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `flight_number` varchar(20) NOT NULL,
  `airline` varchar(50) NOT NULL,
  `origin_code` varchar(10) DEFAULT NULL,
  `destination_code` varchar(10) DEFAULT NULL,
  `departure_time` datetime DEFAULT NULL,
  `arrival_time` datetime DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `origin_code` (`origin_code`),
  KEY `destination_code` (`destination_code`),
  CONSTRAINT `flights_ibfk_1` FOREIGN KEY (`origin_code`) REFERENCES `airports` (`code`),
  CONSTRAINT `flights_ibfk_2` FOREIGN KEY (`destination_code`) REFERENCES `airports` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=285 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flights`
--

LOCK TABLES `flights` WRITE;
/*!40000 ALTER TABLE `flights` DISABLE KEYS */;
INSERT INTO `flights` VALUES (1,'BA101','British Airways','JFK','LHR','2026-07-05 00:00:00','2026-07-05 07:00:00',520.00),(2,'VS150','Virgin Atlantic','JFK','LHR','2026-07-05 06:00:00','2026-07-05 13:00:00',490.00),(3,'DL388','Delta','JFK','LHR','2026-07-05 12:00:00','2026-07-05 19:00:00',610.00),(4,'AA200','American Airlines','JFK','LHR','2026-07-05 18:00:00','2026-07-06 01:00:00',310.00),(5,'BA102','British Airways','LHR','JFK','2026-07-05 09:00:00','2026-07-05 12:00:00',550.00),(6,'VS151','Virgin Atlantic','LHR','JFK','2026-07-05 14:00:00','2026-07-05 17:00:00',510.00),(7,'AF301','Air France','JFK','CDG','2026-07-05 01:00:00','2026-07-05 08:00:00',430.00),(8,'DL302','Delta','JFK','CDG','2026-07-05 14:00:00','2026-07-05 21:00:00',400.00),(9,'AF302','Air France','CDG','JFK','2026-07-05 10:00:00','2026-07-05 13:00:00',450.00),(10,'UA303','United Airlines','CDG','JFK','2026-07-05 16:00:00','2026-07-05 19:00:00',420.00),(11,'EK211','Emirates','JFK','DXB','2026-07-05 00:00:00','2026-07-05 12:00:00',580.00),(12,'QR212','Qatar Airways','JFK','DXB','2026-07-05 06:00:00','2026-07-05 18:00:00',560.00),(13,'EK213','Emirates','DXB','JFK','2026-07-05 02:00:00','2026-07-05 08:00:00',590.00),(14,'QR214','Qatar Airways','DXB','JFK','2026-07-05 14:00:00','2026-07-05 20:00:00',570.00),(15,'EK001','Emirates','LHR','DXB','2026-07-05 06:00:00','2026-07-05 13:00:00',480.00),(16,'BA107','British Airways','LHR','DXB','2026-07-05 14:00:00','2026-07-05 21:00:00',500.00),(17,'EK002','Emirates','DXB','LHR','2026-07-05 02:00:00','2026-07-05 09:00:00',490.00),(18,'FZ003','flydubai','DXB','LHR','2026-07-05 10:00:00','2026-07-05 17:00:00',350.00),(19,'EK401','Emirates','DXB','SIN','2026-07-05 02:00:00','2026-07-05 09:00:00',420.00),(20,'SQ402','Singapore Airlines','DXB','SIN','2026-07-05 14:00:00','2026-07-05 21:00:00',390.00),(21,'EK402','Emirates','SIN','DXB','2026-07-05 01:00:00','2026-07-05 08:00:00',410.00),(22,'SQ403','Singapore Airlines','SIN','DXB','2026-07-05 10:00:00','2026-07-05 17:00:00',380.00),(23,'EK414','Emirates','DXB','SYD','2026-07-05 14:30:00','2026-07-06 04:30:00',760.00),(24,'QF415','Qantas','DXB','SYD','2026-07-05 20:00:00','2026-07-06 10:00:00',730.00),(25,'EK413','Emirates','SYD','DXB','2026-07-05 06:00:00','2026-07-05 20:00:00',750.00),(26,'QF414','Qantas','SYD','DXB','2026-07-05 14:00:00','2026-07-06 04:00:00',720.00),(27,'SQ211','Singapore Airlines','SIN','SYD','2026-07-05 08:00:00','2026-07-05 16:00:00',460.00),(28,'QF212','Qantas','SIN','SYD','2026-07-05 18:00:00','2026-07-06 02:00:00',430.00),(29,'SQ212','Singapore Airlines','SYD','SIN','2026-07-05 07:00:00','2026-07-05 15:00:00',450.00),(30,'QF213','Qantas','SYD','SIN','2026-07-05 19:00:00','2026-07-06 03:00:00',420.00),(31,'SQ011','Singapore Airlines','SIN','HND','2026-07-05 01:00:00','2026-07-05 08:00:00',510.00),(32,'NH012','ANA','SIN','HND','2026-07-05 10:00:00','2026-07-05 17:00:00',480.00),(33,'SQ012','Singapore Airlines','HND','SIN','2026-07-05 09:00:00','2026-07-05 16:00:00',500.00),(34,'JL013','Japan Airlines','HND','SIN','2026-07-05 18:00:00','2026-07-06 01:00:00',460.00),(35,'CA001','Air China','HND','PEK','2026-07-05 08:00:00','2026-07-05 11:00:00',220.00),(36,'NH002','ANA','HND','PEK','2026-07-05 15:00:00','2026-07-05 18:00:00',240.00),(37,'CA002','Air China','PEK','HND','2026-07-05 07:00:00','2026-07-05 10:00:00',230.00),(38,'CZ003','China Southern','PEK','HND','2026-07-05 14:00:00','2026-07-05 17:00:00',210.00),(39,'LH501','Lufthansa','FRA','CDG','2026-07-05 07:00:00','2026-07-05 08:30:00',120.00),(40,'AF502','Air France','FRA','CDG','2026-07-05 14:00:00','2026-07-05 15:30:00',110.00),(41,'LH503','Lufthansa','CDG','FRA','2026-07-05 10:00:00','2026-07-05 11:30:00',115.00),(42,'AF504','Air France','CDG','FRA','2026-07-05 17:00:00','2026-07-05 18:30:00',105.00),(43,'LH601','Lufthansa','FRA','DXB','2026-07-05 06:00:00','2026-07-05 12:00:00',370.00),(44,'EK602','Emirates','FRA','DXB','2026-07-05 14:00:00','2026-07-05 20:00:00',350.00),(45,'LH603','Lufthansa','DXB','FRA','2026-07-05 02:00:00','2026-07-05 08:00:00',360.00),(46,'EK604','Emirates','DXB','FRA','2026-07-05 14:00:00','2026-07-05 20:00:00',340.00),(47,'BA071','British Airways','PEK','LHR','2026-07-05 01:00:00','2026-07-05 11:00:00',680.00),(48,'CA072','Air China','PEK','LHR','2026-07-05 13:00:00','2026-07-05 23:00:00',650.00),(49,'BA073','British Airways','LHR','PEK','2026-07-05 01:00:00','2026-07-05 11:00:00',670.00),(50,'CA074','Air China','LHR','PEK','2026-07-05 13:00:00','2026-07-05 23:00:00',640.00),(51,'SQ301','Singapore Airlines','LHR','SIN','2026-07-05 01:00:00','2026-07-05 14:00:00',550.00),(52,'BA302','British Airways','LHR','SIN','2026-07-05 10:00:00','2026-07-05 23:00:00',530.00),(53,'SQ303','Singapore Airlines','SIN','LHR','2026-07-05 01:00:00','2026-07-05 14:00:00',540.00),(54,'BA304','British Airways','SIN','LHR','2026-07-05 12:00:00','2026-07-06 01:00:00',520.00),(55,'AF701','Air France','CDG','DXB','2026-07-05 07:00:00','2026-07-05 13:00:00',400.00),(56,'EK702','Emirates','CDG','DXB','2026-07-05 15:00:00','2026-07-05 21:00:00',380.00),(57,'AF703','Air France','DXB','CDG','2026-07-05 02:00:00','2026-07-05 08:00:00',390.00),(58,'EK704','Emirates','DXB','CDG','2026-07-05 14:00:00','2026-07-05 20:00:00',370.00),(59,'LH801','Lufthansa','FRA','SIN','2026-07-05 01:00:00','2026-07-05 13:00:00',560.00),(60,'SQ802','Singapore Airlines','FRA','SIN','2026-07-05 10:00:00','2026-07-05 22:00:00',540.00),(61,'LH803','Lufthansa','SIN','FRA','2026-07-05 01:00:00','2026-07-05 13:00:00',550.00),(62,'SQ804','Singapore Airlines','SIN','FRA','2026-07-05 12:00:00','2026-07-06 00:00:00',530.00),(63,'BA101B','British Airways','JFK','LHR','2026-07-06 00:00:00','2026-07-06 07:00:00',535.00),(64,'EK211B','Emirates','JFK','DXB','2026-07-06 00:00:00','2026-07-06 12:00:00',595.00),(65,'EK001B','Emirates','LHR','DXB','2026-07-06 06:00:00','2026-07-06 13:00:00',490.00),(66,'EK401B','Emirates','DXB','SIN','2026-07-06 14:00:00','2026-07-06 21:00:00',430.00),(67,'SQ211B','Singapore Airlines','SIN','SYD','2026-07-06 08:00:00','2026-07-06 16:00:00',470.00),(68,'AF301B','Air France','JFK','CDG','2026-07-06 01:00:00','2026-07-06 08:00:00',445.00),(69,'LH601B','Lufthansa','FRA','DXB','2026-07-06 06:00:00','2026-07-06 12:00:00',380.00),(70,'BA102B','British Airways','LHR','JFK','2026-07-06 09:00:00','2026-07-06 12:00:00',560.00),(71,'SQ012B','Singapore Airlines','HND','SIN','2026-07-06 09:00:00','2026-07-06 16:00:00',510.00),(72,'EK414B','Emirates','DXB','SYD','2026-07-06 14:30:00','2026-07-07 04:30:00',775.00),(73,'BA101C','British Airways','JFK','LHR','2026-07-07 06:00:00','2026-07-07 13:00:00',510.00),(74,'QR212B','Qatar Airways','JFK','DXB','2026-07-07 06:00:00','2026-07-07 18:00:00',570.00),(75,'EK001C','Emirates','LHR','DXB','2026-07-07 14:00:00','2026-07-07 21:00:00',495.00),(76,'SQ402B','Singapore Airlines','DXB','SIN','2026-07-07 14:00:00','2026-07-07 21:00:00',400.00),(77,'QF212B','Qantas','SIN','SYD','2026-07-07 18:00:00','2026-07-08 02:00:00',440.00),(78,'DL302B','Delta','JFK','CDG','2026-07-07 14:00:00','2026-07-07 21:00:00',415.00),(79,'EK602B','Emirates','FRA','DXB','2026-07-07 14:00:00','2026-07-07 20:00:00',360.00),(80,'VS151B','Virgin Atlantic','LHR','JFK','2026-07-07 14:00:00','2026-07-07 17:00:00',520.00),(81,'CA001B','Air China','HND','PEK','2026-07-07 08:00:00','2026-07-07 11:00:00',225.00),(82,'EK413B','Emirates','SYD','DXB','2026-07-07 06:00:00','2026-07-07 20:00:00',760.00),(83,'DL388B','Delta','JFK','LHR','2026-07-08 12:00:00','2026-07-08 19:00:00',620.00),(84,'EK211C','Emirates','JFK','DXB','2026-07-08 00:00:00','2026-07-08 12:00:00',585.00),(85,'BA107B','British Airways','LHR','DXB','2026-07-08 14:00:00','2026-07-08 21:00:00',510.00),(86,'EK401C','Emirates','DXB','SIN','2026-07-08 02:00:00','2026-07-08 09:00:00',425.00),(87,'SQ211C','Singapore Airlines','SIN','SYD','2026-07-08 18:00:00','2026-07-09 02:00:00',445.00),(88,'AF302B','Air France','CDG','JFK','2026-07-08 10:00:00','2026-07-08 13:00:00',455.00),(89,'LH501B','Lufthansa','FRA','CDG','2026-07-08 07:00:00','2026-07-08 08:30:00',125.00),(90,'NH012B','ANA','SIN','HND','2026-07-08 10:00:00','2026-07-08 17:00:00',490.00),(91,'CA072B','Air China','PEK','LHR','2026-07-08 13:00:00','2026-07-08 23:00:00',660.00),(92,'QF415B','Qantas','DXB','SYD','2026-07-08 20:00:00','2026-07-09 10:00:00',740.00),(93,'AA200B','American Airlines','JFK','LHR','2026-07-10 18:00:00','2026-07-11 01:00:00',320.00),(94,'EK211D','Emirates','JFK','DXB','2026-07-10 06:00:00','2026-07-10 18:00:00',590.00),(95,'EK001D','Emirates','LHR','DXB','2026-07-10 06:00:00','2026-07-10 13:00:00',485.00),(96,'SQ402C','Singapore Airlines','DXB','SIN','2026-07-10 14:00:00','2026-07-10 21:00:00',395.00),(97,'SQ211D','Singapore Airlines','SIN','SYD','2026-07-10 08:00:00','2026-07-10 16:00:00',460.00),(98,'UA303B','United Airlines','CDG','JFK','2026-07-10 16:00:00','2026-07-10 19:00:00',430.00),(99,'AF701B','Air France','CDG','DXB','2026-07-10 07:00:00','2026-07-10 13:00:00',410.00),(100,'SQ011B','Singapore Airlines','SIN','HND','2026-07-10 01:00:00','2026-07-10 08:00:00',515.00),(101,'BA071B','British Airways','PEK','LHR','2026-07-10 01:00:00','2026-07-10 11:00:00',690.00),(102,'EK414C','Emirates','DXB','SYD','2026-07-10 20:00:00','2026-07-11 10:00:00',765.00),(103,'VS150B','Virgin Atlantic','JFK','LHR','2026-07-12 06:00:00','2026-07-12 13:00:00',495.00),(104,'QR212C','Qatar Airways','JFK','DXB','2026-07-12 06:00:00','2026-07-12 18:00:00',565.00),(105,'FZ003B','flydubai','DXB','LHR','2026-07-12 10:00:00','2026-07-12 17:00:00',355.00),(106,'EK401D','Emirates','DXB','SIN','2026-07-12 14:00:00','2026-07-12 21:00:00',420.00),(107,'QF212C','Qantas','SIN','SYD','2026-07-12 18:00:00','2026-07-13 02:00:00',435.00),(108,'AF301C','Air France','JFK','CDG','2026-07-12 01:00:00','2026-07-12 08:00:00',440.00),(109,'LH601C','Lufthansa','FRA','DXB','2026-07-12 06:00:00','2026-07-12 12:00:00',375.00),(110,'JL013B','Japan Airlines','HND','SIN','2026-07-12 18:00:00','2026-07-13 01:00:00',465.00),(111,'CA074B','Air China','LHR','PEK','2026-07-12 13:00:00','2026-07-12 23:00:00',645.00),(112,'QF414B','Qantas','SYD','DXB','2026-07-12 14:00:00','2026-07-13 04:00:00',725.00),(113,'BA101D','British Airways','JFK','LHR','2026-07-15 00:00:00','2026-07-15 07:00:00',525.00),(114,'EK211E','Emirates','JFK','DXB','2026-07-15 00:00:00','2026-07-15 12:00:00',580.00),(115,'EK001E','Emirates','LHR','DXB','2026-07-15 06:00:00','2026-07-15 13:00:00',488.00),(116,'EK401E','Emirates','DXB','SIN','2026-07-15 14:00:00','2026-07-15 21:00:00',428.00),(117,'SQ211E','Singapore Airlines','SIN','SYD','2026-07-15 08:00:00','2026-07-15 16:00:00',462.00),(118,'DL302C','Delta','JFK','CDG','2026-07-15 14:00:00','2026-07-15 21:00:00',405.00),(119,'EK602C','Emirates','FRA','DXB','2026-07-15 14:00:00','2026-07-15 20:00:00',355.00),(120,'SQ012C','Singapore Airlines','HND','SIN','2026-07-15 09:00:00','2026-07-15 16:00:00',505.00),(121,'BA073B','British Airways','LHR','PEK','2026-07-15 01:00:00','2026-07-15 11:00:00',672.00),(122,'EK414D','Emirates','DXB','SYD','2026-07-15 14:30:00','2026-07-16 04:30:00',762.00),(123,'AA200C','American Airlines','JFK','LHR','2026-07-20 18:00:00','2026-07-21 01:00:00',315.00),(124,'EK211F','Emirates','JFK','DXB','2026-07-20 00:00:00','2026-07-20 12:00:00',582.00),(125,'BA107C','British Airways','LHR','DXB','2026-07-20 14:00:00','2026-07-20 21:00:00',505.00),(126,'SQ402D','Singapore Airlines','DXB','SIN','2026-07-20 14:00:00','2026-07-20 21:00:00',392.00),(127,'QF212D','Qantas','SIN','SYD','2026-07-20 18:00:00','2026-07-21 02:00:00',432.00),(128,'AF302C','Air France','CDG','JFK','2026-07-20 10:00:00','2026-07-20 13:00:00',452.00),(129,'LH601D','Lufthansa','FRA','DXB','2026-07-20 06:00:00','2026-07-20 12:00:00',372.00),(130,'NH012C','ANA','SIN','HND','2026-07-20 10:00:00','2026-07-20 17:00:00',485.00),(131,'EK413C','Emirates','SYD','DXB','2026-07-20 06:00:00','2026-07-20 20:00:00',755.00),(132,'QF415C','Qantas','DXB','SYD','2026-07-20 20:00:00','2026-07-21 10:00:00',735.00),(133,'BG001','Biman Bangladesh','DAC','DXB','2026-07-05 02:00:00','2026-07-05 06:00:00',280.00),(134,'EK581','Emirates','DAC','DXB','2026-07-05 22:00:00','2026-07-06 02:00:00',310.00),(135,'BG001B','Biman Bangladesh','DAC','DXB','2026-07-06 02:00:00','2026-07-06 06:00:00',285.00),(136,'EK581B','Emirates','DAC','DXB','2026-07-07 22:00:00','2026-07-08 02:00:00',305.00),(137,'BG001C','Biman Bangladesh','DAC','DXB','2026-07-10 02:00:00','2026-07-10 06:00:00',290.00),(138,'BG001D','Biman Bangladesh','DAC','DXB','2026-07-15 02:00:00','2026-07-15 06:00:00',288.00),(139,'BG001E','Biman Bangladesh','DAC','DXB','2026-07-20 02:00:00','2026-07-20 06:00:00',292.00),(140,'BG002','Biman Bangladesh','DXB','DAC','2026-07-05 08:00:00','2026-07-05 13:00:00',275.00),(141,'EK582','Emirates','DXB','DAC','2026-07-05 14:00:00','2026-07-05 19:00:00',300.00),(142,'BG002B','Biman Bangladesh','DXB','DAC','2026-07-07 08:00:00','2026-07-07 13:00:00',278.00),(143,'BG002C','Biman Bangladesh','DXB','DAC','2026-07-12 08:00:00','2026-07-12 13:00:00',282.00),(144,'BG002D','Biman Bangladesh','DXB','DAC','2026-07-20 08:00:00','2026-07-20 13:00:00',280.00),(145,'SQ446','Singapore Airlines','DAC','SIN','2026-07-05 01:00:00','2026-07-05 08:00:00',320.00),(146,'BG011','Biman Bangladesh','DAC','SIN','2026-07-05 14:00:00','2026-07-05 21:00:00',295.00),(147,'SQ446B','Singapore Airlines','DAC','SIN','2026-07-07 01:00:00','2026-07-07 08:00:00',325.00),(148,'SQ446C','Singapore Airlines','DAC','SIN','2026-07-10 01:00:00','2026-07-10 08:00:00',318.00),(149,'SQ446D','Singapore Airlines','DAC','SIN','2026-07-15 01:00:00','2026-07-15 08:00:00',322.00),(150,'SQ446E','Singapore Airlines','DAC','SIN','2026-07-20 01:00:00','2026-07-20 08:00:00',315.00),(151,'SQ447','Singapore Airlines','SIN','DAC','2026-07-05 10:00:00','2026-07-05 13:00:00',315.00),(152,'SQ447B','Singapore Airlines','SIN','DAC','2026-07-08 10:00:00','2026-07-08 13:00:00',318.00),(153,'SQ447C','Singapore Airlines','SIN','DAC','2026-07-15 10:00:00','2026-07-15 13:00:00',312.00),(154,'TG321','Thai Airways','DAC','BKK','2026-07-05 06:00:00','2026-07-05 10:00:00',220.00),(155,'BG021','Biman Bangladesh','DAC','BKK','2026-07-05 18:00:00','2026-07-05 22:00:00',200.00),(156,'TG321B','Thai Airways','DAC','BKK','2026-07-07 06:00:00','2026-07-07 10:00:00',225.00),(157,'TG321C','Thai Airways','DAC','BKK','2026-07-10 06:00:00','2026-07-10 10:00:00',218.00),(158,'TG321D','Thai Airways','DAC','BKK','2026-07-15 06:00:00','2026-07-15 10:00:00',222.00),(159,'TG321E','Thai Airways','DAC','BKK','2026-07-20 06:00:00','2026-07-20 10:00:00',215.00),(160,'TG322','Thai Airways','BKK','DAC','2026-07-05 12:00:00','2026-07-05 14:00:00',215.00),(161,'TG322B','Thai Airways','BKK','DAC','2026-07-08 12:00:00','2026-07-08 14:00:00',218.00),(162,'TG322C','Thai Airways','BKK','DAC','2026-07-12 12:00:00','2026-07-12 14:00:00',212.00),(163,'TG322D','Thai Airways','BKK','DAC','2026-07-20 12:00:00','2026-07-20 14:00:00',210.00),(164,'TK712','Turkish Airlines','DAC','IST','2026-07-05 01:00:00','2026-07-05 08:00:00',450.00),(165,'TK712B','Turkish Airlines','DAC','IST','2026-07-07 01:00:00','2026-07-07 08:00:00',455.00),(166,'TK712C','Turkish Airlines','DAC','IST','2026-07-12 01:00:00','2026-07-12 08:00:00',445.00),(167,'TK712D','Turkish Airlines','DAC','IST','2026-07-20 01:00:00','2026-07-20 08:00:00',448.00),(168,'TK713','Turkish Airlines','IST','DAC','2026-07-05 10:00:00','2026-07-05 22:00:00',445.00),(169,'TK713B','Turkish Airlines','IST','DAC','2026-07-10 10:00:00','2026-07-10 22:00:00',440.00),(170,'TK713C','Turkish Airlines','IST','DAC','2026-07-15 10:00:00','2026-07-15 22:00:00',442.00),(171,'MU501','China Eastern','PVG','SIN','2026-07-05 08:00:00','2026-07-05 14:00:00',340.00),(172,'SQ831','Singapore Airlines','PVG','SIN','2026-07-05 14:00:00','2026-07-05 20:00:00',360.00),(173,'MU501B','China Eastern','PVG','SIN','2026-07-06 08:00:00','2026-07-06 14:00:00',345.00),(174,'MU501C','China Eastern','PVG','SIN','2026-07-08 08:00:00','2026-07-08 14:00:00',338.00),(175,'SQ831B','Singapore Airlines','PVG','SIN','2026-07-10 14:00:00','2026-07-10 20:00:00',355.00),(176,'MU501D','China Eastern','PVG','SIN','2026-07-12 08:00:00','2026-07-12 14:00:00',342.00),(177,'MU501E','China Eastern','PVG','SIN','2026-07-15 08:00:00','2026-07-15 14:00:00',348.00),(178,'MU501F','China Eastern','PVG','SIN','2026-07-20 08:00:00','2026-07-20 14:00:00',340.00),(179,'MU502','China Eastern','SIN','PVG','2026-07-05 16:00:00','2026-07-05 22:00:00',335.00),(180,'SQ832','Singapore Airlines','SIN','PVG','2026-07-05 22:00:00','2026-07-06 04:00:00',355.00),(181,'MU502B','China Eastern','SIN','PVG','2026-07-08 16:00:00','2026-07-08 22:00:00',338.00),(182,'MU502C','China Eastern','SIN','PVG','2026-07-15 16:00:00','2026-07-15 22:00:00',333.00),(183,'MU502D','China Eastern','SIN','PVG','2026-07-20 16:00:00','2026-07-20 22:00:00',336.00),(184,'MU531','China Eastern','PVG','HND','2026-07-05 07:00:00','2026-07-05 10:00:00',250.00),(185,'NH921','ANA','PVG','HND','2026-07-05 14:00:00','2026-07-05 17:00:00',270.00),(186,'MU531B','China Eastern','PVG','HND','2026-07-07 07:00:00','2026-07-07 10:00:00',255.00),(187,'MU531C','China Eastern','PVG','HND','2026-07-10 07:00:00','2026-07-10 10:00:00',248.00),(188,'MU531D','China Eastern','PVG','HND','2026-07-15 07:00:00','2026-07-15 10:00:00',252.00),(189,'MU531E','China Eastern','PVG','HND','2026-07-20 07:00:00','2026-07-20 10:00:00',246.00),(190,'MU532','China Eastern','HND','PVG','2026-07-05 12:00:00','2026-07-05 15:00:00',245.00),(191,'NH922','ANA','HND','PVG','2026-07-05 19:00:00','2026-07-05 22:00:00',265.00),(192,'MU532B','China Eastern','HND','PVG','2026-07-08 12:00:00','2026-07-08 15:00:00',248.00),(193,'MU532C','China Eastern','HND','PVG','2026-07-15 12:00:00','2026-07-15 15:00:00',243.00),(194,'MU551','China Eastern','PVG','LHR','2026-07-05 00:00:00','2026-07-05 07:00:00',580.00),(195,'BA038','British Airways','PVG','LHR','2026-07-05 13:00:00','2026-07-05 20:00:00',610.00),(196,'MU551B','China Eastern','PVG','LHR','2026-07-08 00:00:00','2026-07-08 07:00:00',585.00),(197,'MU551C','China Eastern','PVG','LHR','2026-07-15 00:00:00','2026-07-15 07:00:00',575.00),(198,'MU551D','China Eastern','PVG','LHR','2026-07-20 00:00:00','2026-07-20 07:00:00',578.00),(199,'MU552','China Eastern','LHR','PVG','2026-07-05 22:00:00','2026-07-06 16:00:00',575.00),(200,'BA039','British Airways','LHR','PVG','2026-07-07 09:00:00','2026-07-08 03:00:00',605.00),(201,'MU552B','China Eastern','LHR','PVG','2026-07-12 22:00:00','2026-07-13 16:00:00',570.00),(202,'MU552C','China Eastern','LHR','PVG','2026-07-20 22:00:00','2026-07-21 16:00:00',572.00),(203,'TG401','Thai Airways','BKK','SIN','2026-07-05 08:00:00','2026-07-05 11:00:00',180.00),(204,'SQ971','Singapore Airlines','BKK','SIN','2026-07-05 14:00:00','2026-07-05 17:00:00',195.00),(205,'TG401B','Thai Airways','BKK','SIN','2026-07-06 08:00:00','2026-07-06 11:00:00',182.00),(206,'TG401C','Thai Airways','BKK','SIN','2026-07-07 08:00:00','2026-07-07 11:00:00',178.00),(207,'SQ971B','Singapore Airlines','BKK','SIN','2026-07-08 14:00:00','2026-07-08 17:00:00',192.00),(208,'TG401D','Thai Airways','BKK','SIN','2026-07-10 08:00:00','2026-07-10 11:00:00',180.00),(209,'TG401E','Thai Airways','BKK','SIN','2026-07-12 08:00:00','2026-07-12 11:00:00',175.00),(210,'TG401F','Thai Airways','BKK','SIN','2026-07-15 08:00:00','2026-07-15 11:00:00',183.00),(211,'TG401G','Thai Airways','BKK','SIN','2026-07-20 08:00:00','2026-07-20 11:00:00',177.00),(212,'TG402','Thai Airways','SIN','BKK','2026-07-05 13:00:00','2026-07-05 16:00:00',175.00),(213,'SQ972','Singapore Airlines','SIN','BKK','2026-07-05 19:00:00','2026-07-05 22:00:00',190.00),(214,'TG402B','Thai Airways','SIN','BKK','2026-07-08 13:00:00','2026-07-08 16:00:00',178.00),(215,'TG402C','Thai Airways','SIN','BKK','2026-07-15 13:00:00','2026-07-15 16:00:00',172.00),(216,'TG402D','Thai Airways','SIN','BKK','2026-07-20 13:00:00','2026-07-20 16:00:00',174.00),(217,'EK371','Emirates','BKK','DXB','2026-07-05 01:00:00','2026-07-05 05:00:00',350.00),(218,'TG501','Thai Airways','BKK','DXB','2026-07-05 23:00:00','2026-07-06 03:00:00',330.00),(219,'EK371B','Emirates','BKK','DXB','2026-07-07 01:00:00','2026-07-07 05:00:00',355.00),(220,'EK371C','Emirates','BKK','DXB','2026-07-10 01:00:00','2026-07-10 05:00:00',348.00),(221,'EK371D','Emirates','BKK','DXB','2026-07-15 01:00:00','2026-07-15 05:00:00',352.00),(222,'EK371E','Emirates','BKK','DXB','2026-07-20 01:00:00','2026-07-20 05:00:00',345.00),(223,'EK372','Emirates','DXB','BKK','2026-07-05 07:00:00','2026-07-05 14:00:00',345.00),(224,'EK372B','Emirates','DXB','BKK','2026-07-08 07:00:00','2026-07-08 14:00:00',348.00),(225,'EK372C','Emirates','DXB','BKK','2026-07-12 07:00:00','2026-07-12 14:00:00',342.00),(226,'EK372D','Emirates','DXB','BKK','2026-07-20 07:00:00','2026-07-20 14:00:00',340.00),(227,'TG910','Thai Airways','BKK','LHR','2026-07-05 00:00:00','2026-07-05 08:00:00',520.00),(228,'BA010','British Airways','BKK','LHR','2026-07-05 23:30:00','2026-07-06 07:00:00',545.00),(229,'TG910B','Thai Airways','BKK','LHR','2026-07-08 00:00:00','2026-07-08 08:00:00',525.00),(230,'TG910C','Thai Airways','BKK','LHR','2026-07-15 00:00:00','2026-07-15 08:00:00',518.00),(231,'TG910D','Thai Airways','BKK','LHR','2026-07-20 00:00:00','2026-07-20 08:00:00',522.00),(232,'TG911','Thai Airways','LHR','BKK','2026-07-05 21:00:00','2026-07-06 14:00:00',515.00),(233,'BA011','British Airways','LHR','BKK','2026-07-07 21:00:00','2026-07-08 14:00:00',540.00),(234,'TG911B','Thai Airways','LHR','BKK','2026-07-12 21:00:00','2026-07-13 14:00:00',510.00),(235,'TG911C','Thai Airways','LHR','BKK','2026-07-20 21:00:00','2026-07-21 14:00:00',512.00),(236,'TG660','Thai Airways','BKK','HND','2026-07-05 08:00:00','2026-07-05 16:00:00',380.00),(237,'JL028','Japan Airlines','BKK','HND','2026-07-05 22:00:00','2026-07-06 06:00:00',395.00),(238,'TG660B','Thai Airways','BKK','HND','2026-07-08 08:00:00','2026-07-08 16:00:00',385.00),(239,'TG660C','Thai Airways','BKK','HND','2026-07-15 08:00:00','2026-07-15 16:00:00',378.00),(240,'TG660D','Thai Airways','BKK','HND','2026-07-20 08:00:00','2026-07-20 16:00:00',382.00),(241,'TG661','Thai Airways','HND','BKK','2026-07-05 18:00:00','2026-07-06 00:00:00',375.00),(242,'TG661B','Thai Airways','HND','BKK','2026-07-10 18:00:00','2026-07-11 00:00:00',378.00),(243,'TG661C','Thai Airways','HND','BKK','2026-07-20 18:00:00','2026-07-21 00:00:00',372.00),(244,'TK1981','Turkish Airlines','IST','LHR','2026-07-05 07:00:00','2026-07-05 09:30:00',280.00),(245,'BA676','British Airways','IST','LHR','2026-07-05 14:00:00','2026-07-05 16:30:00',295.00),(246,'TK1981B','Turkish Airlines','IST','LHR','2026-07-06 07:00:00','2026-07-06 09:30:00',283.00),(247,'TK1981C','Turkish Airlines','IST','LHR','2026-07-08 07:00:00','2026-07-08 09:30:00',278.00),(248,'TK1981D','Turkish Airlines','IST','LHR','2026-07-10 07:00:00','2026-07-10 09:30:00',282.00),(249,'TK1981E','Turkish Airlines','IST','LHR','2026-07-12 07:00:00','2026-07-12 09:30:00',276.00),(250,'TK1981F','Turkish Airlines','IST','LHR','2026-07-15 07:00:00','2026-07-15 09:30:00',285.00),(251,'TK1981G','Turkish Airlines','IST','LHR','2026-07-20 07:00:00','2026-07-20 09:30:00',279.00),(252,'TK1982','Turkish Airlines','LHR','IST','2026-07-05 11:00:00','2026-07-05 16:00:00',275.00),(253,'BA677','British Airways','LHR','IST','2026-07-05 18:00:00','2026-07-05 23:00:00',290.00),(254,'TK1982B','Turkish Airlines','LHR','IST','2026-07-07 11:00:00','2026-07-07 16:00:00',278.00),(255,'TK1982C','Turkish Airlines','LHR','IST','2026-07-10 11:00:00','2026-07-10 16:00:00',272.00),(256,'TK1982D','Turkish Airlines','LHR','IST','2026-07-15 11:00:00','2026-07-15 16:00:00',280.00),(257,'TK1982E','Turkish Airlines','LHR','IST','2026-07-20 11:00:00','2026-07-20 16:00:00',274.00),(258,'TK760','Turkish Airlines','IST','DXB','2026-07-05 02:00:00','2026-07-05 06:00:00',320.00),(259,'EK129','Emirates','IST','DXB','2026-07-05 16:00:00','2026-07-05 20:00:00',340.00),(260,'TK760B','Turkish Airlines','IST','DXB','2026-07-07 02:00:00','2026-07-07 06:00:00',325.00),(261,'TK760C','Turkish Airlines','IST','DXB','2026-07-10 02:00:00','2026-07-10 06:00:00',318.00),(262,'TK760D','Turkish Airlines','IST','DXB','2026-07-15 02:00:00','2026-07-15 06:00:00',322.00),(263,'TK760E','Turkish Airlines','IST','DXB','2026-07-20 02:00:00','2026-07-20 06:00:00',315.00),(264,'TK761','Turkish Airlines','DXB','IST','2026-07-05 08:00:00','2026-07-05 12:00:00',315.00),(265,'EK130','Emirates','DXB','IST','2026-07-05 22:00:00','2026-07-06 02:00:00',335.00),(266,'TK761B','Turkish Airlines','DXB','IST','2026-07-08 08:00:00','2026-07-08 12:00:00',318.00),(267,'TK761C','Turkish Airlines','DXB','IST','2026-07-12 08:00:00','2026-07-12 12:00:00',312.00),(268,'TK761D','Turkish Airlines','DXB','IST','2026-07-20 08:00:00','2026-07-20 12:00:00',310.00),(269,'TK054','Turkish Airlines','IST','SIN','2026-07-05 01:00:00','2026-07-05 15:00:00',520.00),(270,'SQ392','Singapore Airlines','IST','SIN','2026-07-05 22:00:00','2026-07-06 12:00:00',545.00),(271,'TK054B','Turkish Airlines','IST','SIN','2026-07-08 01:00:00','2026-07-08 15:00:00',525.00),(272,'TK054C','Turkish Airlines','IST','SIN','2026-07-15 01:00:00','2026-07-15 15:00:00',518.00),(273,'TK054D','Turkish Airlines','IST','SIN','2026-07-20 01:00:00','2026-07-20 15:00:00',522.00),(274,'TK055','Turkish Airlines','SIN','IST','2026-07-05 17:00:00','2026-07-06 07:00:00',515.00),(275,'TK055B','Turkish Airlines','SIN','IST','2026-07-10 17:00:00','2026-07-11 07:00:00',518.00),(276,'TK055C','Turkish Airlines','SIN','IST','2026-07-20 17:00:00','2026-07-21 07:00:00',512.00),(277,'TK001','Turkish Airlines','IST','JFK','2026-07-05 10:00:00','2026-07-05 14:00:00',580.00),(278,'TK001B','Turkish Airlines','IST','JFK','2026-07-07 10:00:00','2026-07-07 14:00:00',585.00),(279,'TK001C','Turkish Airlines','IST','JFK','2026-07-12 10:00:00','2026-07-12 14:00:00',575.00),(280,'TK001D','Turkish Airlines','IST','JFK','2026-07-20 10:00:00','2026-07-20 14:00:00',578.00),(281,'TK002','Turkish Airlines','JFK','IST','2026-07-05 22:00:00','2026-07-06 17:00:00',575.00),(282,'TK002B','Turkish Airlines','JFK','IST','2026-07-08 22:00:00','2026-07-09 17:00:00',580.00),(283,'TK002C','Turkish Airlines','JFK','IST','2026-07-15 22:00:00','2026-07-16 17:00:00',570.00),(284,'TK002D','Turkish Airlines','JFK','IST','2026-07-20 22:00:00','2026-07-21 17:00:00',572.00);
/*!40000 ALTER TABLE `flights` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trips` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `origin` varchar(10) NOT NULL,
  `destination` varchar(10) NOT NULL,
  `flight_number` varchar(50) NOT NULL,
  `airline` varchar(100) DEFAULT '',
  `seat_class` varchar(50) DEFAULT 'Economy',
  `travelers` int(11) DEFAULT 1,
  `departure_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `total_cost` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `status` varchar(50) DEFAULT 'upcoming',
  `bookmarked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `is_verified` tinyint(1) DEFAULT 0,
  `otp_code` varchar(10) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `seat_preference` varchar(50) DEFAULT 'Any',
  `meal_preference` varchar(50) DEFAULT 'Any',
  `profile_picture` longtext DEFAULT NULL,
  `first_name` varchar(100) DEFAULT '',
  `last_name` varchar(100) DEFAULT '',
  `dob` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT '',
  `phone` varchar(30) DEFAULT '',
  `passport_number` varchar(50) DEFAULT '',
  `passport_expiry` date DEFAULT NULL,
  `nationality` varchar(100) DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin123','admin@flightbooking.com','admin',1,NULL,NULL,'Any','Any',NULL,'','',NULL,'','','',NULL,''),(2,'hasan','265249','skhasan516578@gmail.com','user',1,NULL,NULL,'Any','Any',NULL,'Md','Hasan','2001-03-10','Male','19708869076','A0933234','2032-11-02','Bangladeshi');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-22 20:20:06
