import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "mc-explorer.db"));

db.pragma("journal_mode = WAL");

// ---------- Schema ----------
db.exec(`
CREATE TABLE IF NOT EXISTS microcontrollers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  architecture TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  clock_speed TEXT NOT NULL,
  flash_memory TEXT NOT NULL,
  ram TEXT NOT NULL,
  operating_voltage TEXT NOT NULL,
  io_pins_count INTEGER NOT NULL,
  adc_channels TEXT NOT NULL,
  communication TEXT NOT NULL,      -- comma separated: I2C,SPI,UART,USB,WiFi,BLE
  package_type TEXT NOT NULL,
  price_range TEXT NOT NULL,
  buy_url TEXT NOT NULL,
  datasheet_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  microcontroller_id INTEGER NOT NULL,
  pin_number TEXT NOT NULL,
  pin_name TEXT NOT NULL,
  pin_type TEXT NOT NULL,   -- power, ground, gpio, adc, pwm, comm, other
  description TEXT NOT NULL,
  FOREIGN KEY (microcontroller_id) REFERENCES microcontrollers(id)
);
`);

// ---------- Seed (only if empty) ----------
const count = db.prepare("SELECT COUNT(*) AS c FROM microcontrollers").get().c;

if (count === 0) {
  const insertMc = db.prepare(`
    INSERT INTO microcontrollers
      (slug, name, manufacturer, architecture, short_description, long_description,
       clock_speed, flash_memory, ram, operating_voltage, io_pins_count, adc_channels,
       communication, package_type, price_range, buy_url, datasheet_url)
    VALUES (@slug, @name, @manufacturer, @architecture, @short_description, @long_description,
       @clock_speed, @flash_memory, @ram, @operating_voltage, @io_pins_count, @adc_channels,
       @communication, @package_type, @price_range, @buy_url, @datasheet_url)
  `);

  const insertPin = db.prepare(`
    INSERT INTO pins (microcontroller_id, pin_number, pin_name, pin_type, description)
    VALUES (@microcontroller_id, @pin_number, @pin_name, @pin_type, @description)
  `);

  const seed = [
    {
      mc: {
        slug: "esp32-devkit",
        name: "ESP32",
        manufacturer: "Espressif Systems",
        architecture: "32-bit Xtensa LX6 (dual-core)",
        short_description: "Wi-Fi + Bluetooth dual-core beast, the default choice for IoT projects.",
        long_description:
          "The ESP32 is a low-cost, low-power dual-core microcontroller with integrated Wi-Fi and Bluetooth (Classic + BLE). It is the most widely used chip for IoT and hobbyist wireless projects, offering a large number of GPIOs, hardware peripherals (I2C, SPI, UART, ADC, DAC, touch sensing) and an active open-source ecosystem (Arduino IDE, ESP-IDF, MicroPython).",
        clock_speed: "Up to 240 MHz",
        flash_memory: "4 MB (typical dev board)",
        ram: "520 KB SRAM",
        operating_voltage: "3.3V",
        io_pins_count: 34,
        adc_channels: "18 (12-bit)",
        communication: "WiFi,BLE,I2C,SPI,UART,I2S",
        package_type: "QFN-48 (module on dev board)",
        price_range: "₹250 – ₹600",
        buy_url: "https://www.espressif.com/en/products/socs/esp32",
        datasheet_url: "https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf"
      },
      pins: [
        { pin_number: "1", pin_name: "3V3", pin_type: "power", description: "3.3V power output/input for the board." },
        { pin_number: "2", pin_name: "EN", pin_type: "other", description: "Chip enable, active high. Pull low to reset." },
        { pin_number: "3", pin_name: "GPIO36 (VP)", pin_type: "adc", description: "Input-only pin, ADC1 channel 0." },
        { pin_number: "4", pin_name: "GPIO39 (VN)", pin_type: "adc", description: "Input-only pin, ADC1 channel 3." },
        { pin_number: "5", pin_name: "GPIO34", pin_type: "adc", description: "Input-only, ADC1 channel 6." },
        { pin_number: "6", pin_name: "GPIO35", pin_type: "adc", description: "Input-only, ADC1 channel 7." },
        { pin_number: "7", pin_name: "GPIO32", pin_type: "gpio", description: "General GPIO, ADC1 channel 4, touch sensor T9." },
        { pin_number: "8", pin_name: "GPIO33", pin_type: "gpio", description: "General GPIO, ADC1 channel 5, touch sensor T8." },
        { pin_number: "9", pin_name: "GPIO25", pin_type: "gpio", description: "GPIO, ADC2 channel 8, DAC1 output." },
        { pin_number: "10", pin_name: "GPIO26", pin_type: "gpio", description: "GPIO, ADC2 channel 9, DAC2 output." },
        { pin_number: "11", pin_name: "GPIO27", pin_type: "gpio", description: "GPIO, ADC2 channel 7, touch sensor T7." },
        { pin_number: "12", pin_name: "GPIO14", pin_type: "pwm", description: "GPIO, HSPI_CLK, commonly used for PWM." },
        { pin_number: "13", pin_name: "GPIO12", pin_type: "gpio", description: "GPIO, HSPI_MISO. Strapping pin — avoid pulling high at boot." },
        { pin_number: "14", pin_name: "GPIO13", pin_type: "gpio", description: "GPIO, HSPI_MOSI." },
        { pin_number: "15", pin_name: "GPIO21", pin_type: "comm", description: "Default I2C SDA line." },
        { pin_number: "16", pin_name: "GPIO22", pin_type: "comm", description: "Default I2C SCL line." },
        { pin_number: "17", pin_name: "GPIO1 (TX0)", pin_type: "comm", description: "UART0 TX, also used for flashing/serial monitor." },
        { pin_number: "18", pin_name: "GPIO3 (RX0)", pin_type: "comm", description: "UART0 RX, also used for flashing/serial monitor." },
        { pin_number: "19", pin_name: "GND", pin_type: "ground", description: "Ground reference (multiple GND pins on the board)." }
      ]
    },
    {
      mc: {
        slug: "arduino-uno-atmega328p",
        name: "Arduino Uno (ATmega328P)",
        manufacturer: "Microchip / Arduino",
        architecture: "8-bit AVR",
        short_description: "The classic beginner board — simple, robust, endless tutorials.",
        long_description:
          "The Arduino Uno, built around the ATmega328P, is the board almost every electronics student starts with. It trades raw performance for simplicity, reliability, and an enormous library/tutorial ecosystem. Great for learning digital I/O, PWM, ADC and serial communication fundamentals.",
        clock_speed: "16 MHz",
        flash_memory: "32 KB",
        ram: "2 KB SRAM",
        operating_voltage: "5V",
        io_pins_count: 20,
        adc_channels: "6 (10-bit)",
        communication: "I2C,SPI,UART",
        package_type: "DIP-28 / TQFP-32",
        price_range: "₹350 – ₹700 (board)",
        buy_url: "https://store.arduino.cc/products/arduino-uno-rev3",
        datasheet_url: "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf"
      },
      pins: [
        { pin_number: "1", pin_name: "RESET", pin_type: "other", description: "Active-low reset input." },
        { pin_number: "2", pin_name: "D0 (RX)", pin_type: "comm", description: "UART receive." },
        { pin_number: "3", pin_name: "D1 (TX)", pin_type: "comm", description: "UART transmit." },
        { pin_number: "4-13", pin_name: "D2–D13", pin_type: "gpio", description: "Digital I/O; D3,D5,D6,D9,D10,D11 support PWM." },
        { pin_number: "19", pin_name: "SCK/D13", pin_type: "comm", description: "SPI clock, shared with onboard LED pin." },
        { pin_number: "18", pin_name: "MISO/D12", pin_type: "comm", description: "SPI master-in-slave-out." },
        { pin_number: "17", pin_name: "MOSI/D11", pin_type: "comm", description: "SPI master-out-slave-in." },
        { pin_number: "27", pin_name: "SDA/A4", pin_type: "comm", description: "I2C data line (also analog input A4)." },
        { pin_number: "28", pin_name: "SCL/A5", pin_type: "comm", description: "I2C clock line (also analog input A5)." },
        { pin_number: "23-28", pin_name: "A0–A5", pin_type: "adc", description: "6 analog input channels, 10-bit resolution." },
        { pin_number: "7", pin_name: "VCC", pin_type: "power", description: "5V supply pin." },
        { pin_number: "8,22", pin_name: "GND", pin_type: "ground", description: "Ground pins." },
        { pin_number: "20", pin_name: "AVCC", pin_type: "power", description: "Supply voltage for ADC." },
        { pin_number: "21", pin_name: "AREF", pin_type: "other", description: "Analog reference voltage input." }
      ]
    },
    {
      mc: {
        slug: "stm32f103c8t6-bluepill",
        name: "STM32F103C8T6 (\"Blue Pill\")",
        manufacturer: "STMicroelectronics",
        architecture: "32-bit ARM Cortex-M3",
        short_description: "Cheap, powerful ARM board once you outgrow AVR-based boards.",
        long_description:
          "The STM32F103C8T6, sold cheaply on the 'Blue Pill' dev board, is a common step up from 8-bit boards. It offers a real ARM Cortex-M3 core, more peripherals, and DMA support, while remaining inexpensive — popular for more serious embedded projects, motor control and USB device work.",
        clock_speed: "Up to 72 MHz",
        flash_memory: "64 KB (some variants 128 KB)",
        ram: "20 KB SRAM",
        operating_voltage: "3.3V (5V tolerant on most pins)",
        io_pins_count: 37,
        adc_channels: "10 (12-bit)",
        communication: "I2C,SPI,UART,USB,CAN",
        package_type: "LQFP-48",
        price_range: "₹200 – ₹400 (dev board)",
        buy_url: "https://www.st.com/en/microcontrollers-microprocessors/stm32f103c8.html",
        datasheet_url: "https://www.st.com/resource/en/datasheet/stm32f103c8.pdf"
      },
      pins: [
        { pin_number: "PA0-PA7", pin_name: "Port A low", pin_type: "gpio", description: "GPIOs, several with ADC channels 0-7." },
        { pin_number: "PA9", pin_name: "USART1_TX", pin_type: "comm", description: "UART1 transmit." },
        { pin_number: "PA10", pin_name: "USART1_RX", pin_type: "comm", description: "UART1 receive." },
        { pin_number: "PA11", pin_name: "USB_DM", pin_type: "comm", description: "USB data minus line." },
        { pin_number: "PA12", pin_name: "USB_DP", pin_type: "comm", description: "USB data plus line." },
        { pin_number: "PB6", pin_name: "I2C1_SCL", pin_type: "comm", description: "I2C1 clock line." },
        { pin_number: "PB7", pin_name: "I2C1_SDA", pin_type: "comm", description: "I2C1 data line." },
        { pin_number: "PA5", pin_name: "SPI1_SCK", pin_type: "comm", description: "SPI1 clock." },
        { pin_number: "PA6", pin_name: "SPI1_MISO", pin_type: "comm", description: "SPI1 master-in-slave-out." },
        { pin_number: "PA7", pin_name: "SPI1_MOSI", pin_type: "comm", description: "SPI1 master-out-slave-in." },
        { pin_number: "PB0,PB1", pin_name: "TIM3 PWM", pin_type: "pwm", description: "Timer-driven PWM-capable GPIOs." },
        { pin_number: "VBAT", pin_name: "VBAT", pin_type: "power", description: "Backup battery input for RTC." },
        { pin_number: "3V3", pin_name: "3V3", pin_type: "power", description: "3.3V logic supply." },
        { pin_number: "GND", pin_name: "GND", pin_type: "ground", description: "Ground reference." },
        { pin_number: "BOOT0", pin_name: "BOOT0", pin_type: "other", description: "Boot mode select pin (flash vs system bootloader)." }
      ]
    },
    {
      mc: {
        slug: "raspberry-pi-pico-rp2040",
        name: "Raspberry Pi Pico (RP2040)",
        manufacturer: "Raspberry Pi Foundation",
        architecture: "32-bit dual-core ARM Cortex-M0+",
        short_description: "Dual-core chip with unique PIO peripheral for custom protocols.",
        long_description:
          "The RP2040 chip, on the Raspberry Pi Pico board, brings a dual-core Cortex-M0+ with a standout feature: Programmable I/O (PIO) blocks that let you implement custom, hardware-timed protocols in software. Backed by excellent official documentation and both C/C++ SDK and MicroPython support.",
        clock_speed: "133 MHz",
        flash_memory: "2 MB external QSPI flash",
        ram: "264 KB SRAM",
        operating_voltage: "3.3V (input via USB 5V/VSYS 1.8–5.5V)",
        io_pins_count: 26,
        adc_channels: "3 (12-bit) + internal temp sensor",
        communication: "I2C,SPI,UART,USB,PIO",
        package_type: "QFN-56",
        price_range: "₹300 – ₹450",
        buy_url: "https://www.raspberrypi.com/products/raspberry-pi-pico/",
        datasheet_url: "https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf"
      },
      pins: [
        { pin_number: "1", pin_name: "GP0", pin_type: "gpio", description: "General purpose I/O, default UART0 TX." },
        { pin_number: "2", pin_name: "GP1", pin_type: "gpio", description: "General purpose I/O, default UART0 RX." },
        { pin_number: "3", pin_name: "GND", pin_type: "ground", description: "Ground." },
        { pin_number: "4", pin_name: "GP2", pin_type: "gpio", description: "General purpose I/O, default I2C1 SDA." },
        { pin_number: "5", pin_name: "GP3", pin_type: "gpio", description: "General purpose I/O, default I2C1 SCL." },
        { pin_number: "31", pin_name: "GP26/ADC0", pin_type: "adc", description: "GPIO or analog input channel 0." },
        { pin_number: "32", pin_name: "GP27/ADC1", pin_type: "adc", description: "GPIO or analog input channel 1." },
        { pin_number: "34", pin_name: "GP28/ADC2", pin_type: "adc", description: "GPIO or analog input channel 2." },
        { pin_number: "36", pin_name: "3V3(OUT)", pin_type: "power", description: "3.3V regulated output, powers external circuits." },
        { pin_number: "39", pin_name: "VSYS", pin_type: "power", description: "Main system input voltage (1.8V–5.5V)." },
        { pin_number: "40", pin_name: "VBUS", pin_type: "power", description: "5V from USB connector." },
        { pin_number: "30", pin_name: "RUN", pin_type: "other", description: "Enable pin, pull low to reset the chip." },
        { pin_number: "24", pin_name: "GP18/SPI0 SCK", pin_type: "comm", description: "Default SPI0 clock line." },
        { pin_number: "25", pin_name: "GP19/SPI0 TX", pin_type: "comm", description: "Default SPI0 MOSI." },
        { pin_number: "21", pin_name: "GP16/SPI0 RX", pin_type: "comm", description: "Default SPI0 MISO." }
      ]
    },
    {
      mc: {
        slug: "attiny85",
        name: "ATtiny85",
        manufacturer: "Microchip",
        architecture: "8-bit AVR",
        short_description: "Tiny 8-pin chip for the smallest, cheapest embedded projects.",
        long_description:
          "The ATtiny85 packs a usable AVR core into an 8-pin package, making it ideal for small, single-purpose gadgets (LED controllers, tiny USB gadgets, simple sensors) where an Arduino Uno would be overkill. Programmable via the Arduino IDE with an external programmer.",
        clock_speed: "Up to 20 MHz (8 MHz internal typical)",
        flash_memory: "8 KB",
        ram: "512 Bytes SRAM",
        operating_voltage: "2.7V – 5.5V",
        io_pins_count: 6,
        adc_channels: "4 (10-bit)",
        communication: "I2C (USI),SPI (USI)",
        package_type: "DIP-8 / SOIC-8",
        price_range: "₹60 – ₹150",
        buy_url: "https://www.microchip.com/en-us/product/attiny85",
        datasheet_url: "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-2586-AVR-8-bit-Microcontroller-ATtiny25-ATtiny45-ATtiny85_Datasheet.pdf"
      },
      pins: [
        { pin_number: "1", pin_name: "PB5/RESET", pin_type: "other", description: "Reset (active low) or GPIO if reset disabled via fuse." },
        { pin_number: "2", pin_name: "PB3/ADC3", pin_type: "adc", description: "GPIO or analog input channel 3." },
        { pin_number: "3", pin_name: "PB4/ADC2", pin_type: "adc", description: "GPIO or analog input channel 2." },
        { pin_number: "4", pin_name: "GND", pin_type: "ground", description: "Ground reference." },
        { pin_number: "5", pin_name: "PB0/MOSI", pin_type: "comm", description: "GPIO, USI data in/out, PWM capable." },
        { pin_number: "6", pin_name: "PB1/MISO", pin_type: "comm", description: "GPIO, USI data out, PWM capable." },
        { pin_number: "7", pin_name: "PB2/SCK", pin_type: "comm", description: "GPIO, USI clock, ADC1." },
        { pin_number: "8", pin_name: "VCC", pin_type: "power", description: "Supply voltage, 2.7V–5.5V." }
      ]
    },
    {
      mc: {
        slug: "esp8266-esp12e",
        name: "ESP8266 (ESP-12E)",
        manufacturer: "Espressif Systems",
        architecture: "32-bit Tensilica L106",
        short_description: "The original cheap Wi-Fi chip that started the ESP IoT wave.",
        long_description:
          "The ESP8266 was the chip that made Wi-Fi-connected hobby projects affordable. It has fewer GPIOs and peripherals than its successor the ESP32, and no Bluetooth, but remains a solid, cheap choice for simple Wi-Fi sensors and IoT nodes, with wide NodeMCU/Arduino support.",
        clock_speed: "80 MHz (up to 160 MHz)",
        flash_memory: "4 MB (typical NodeMCU board)",
        ram: "~80 KB usable",
        operating_voltage: "3.3V",
        io_pins_count: 17,
        adc_channels: "1 (10-bit, 0-1V range)",
        communication: "WiFi,I2C,SPI,UART",
        package_type: "QFN-32 (module on dev board)",
        price_range: "₹150 – ₹350",
        buy_url: "https://www.espressif.com/en/products/socs/esp8266",
        datasheet_url: "https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf"
      },
      pins: [
        { pin_number: "1", pin_name: "GPIO0", pin_type: "gpio", description: "GPIO, also boot-mode select (flash vs run)." },
        { pin_number: "2", pin_name: "GPIO2", pin_type: "gpio", description: "GPIO, default UART1 TX, must be high at boot." },
        { pin_number: "3", pin_name: "GPIO4", pin_type: "comm", description: "Commonly used as I2C SDA." },
        { pin_number: "4", pin_name: "GPIO5", pin_type: "comm", description: "Commonly used as I2C SCL." },
        { pin_number: "5", pin_name: "A0", pin_type: "adc", description: "Single analog input, 0–1V range on bare chip (0-3.3V on most boards via divider)." },
        { pin_number: "6", pin_name: "GPIO14", pin_type: "comm", description: "SPI CLK / general GPIO." },
        { pin_number: "7", pin_name: "GPIO12", pin_type: "comm", description: "SPI MISO / general GPIO." },
        { pin_number: "8", pin_name: "GPIO13", pin_type: "comm", description: "SPI MOSI / general GPIO." },
        { pin_number: "9", pin_name: "GPIO15", pin_type: "other", description: "Boot-mode strapping pin, must be low at boot." },
        { pin_number: "10", pin_name: "RX (GPIO3)", pin_type: "comm", description: "UART0 receive." },
        { pin_number: "11", pin_name: "TX (GPIO1)", pin_type: "comm", description: "UART0 transmit." },
        { pin_number: "12", pin_name: "EN/CH_PD", pin_type: "other", description: "Chip enable, must be high to run." },
        { pin_number: "13", pin_name: "RST", pin_type: "other", description: "Active-low reset." },
        { pin_number: "14", pin_name: "VCC", pin_type: "power", description: "3.3V supply." },
        { pin_number: "15", pin_name: "GND", pin_type: "ground", description: "Ground reference." }
      ]
    },
{
  "mc": {
    "slug": "stm32f401re",
    "name": "STM32F401RE",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Mainstream Cortex-M4 with FPU, a favorite Nucleo board for control-loop projects.",
    "long_description": "Part of ST's mainstream F4 line, the F401RE pairs a Cortex-M4F core with a rich timer set and DMA, making it a popular pick for motor control, audio and sensor-fusion projects on the Nucleo-64 board.",
    "clock_speed": "Up to 84 MHz",
    "flash_memory": "512 KB",
    "ram": "96 KB SRAM",
    "operating_voltage": "1.7V \u2013 3.6V",
    "io_pins_count": 50,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "LQFP-64",
    "price_range": "\u20b9350 \u2013 \u20b9650",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f401re.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f401re.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 50 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32f411ce-blackpill",
    "name": "STM32F411CEU6 (\"Black Pill\")",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "The 100 MHz upgrade path from the Blue Pill, with more flash and a real crystal-driven USB.",
    "long_description": "The WeAct \"Black Pill\" board puts the STM32F411CE on a Blue-Pill-shaped footprint, giving hobbyists a much faster Cortex-M4F core with USB and more flash for the same tiny form factor and low price.",
    "clock_speed": "Up to 100 MHz",
    "flash_memory": "512 KB",
    "ram": "128 KB SRAM",
    "operating_voltage": "1.7V \u2013 3.6V",
    "io_pins_count": 38,
    "adc_channels": "10 (12-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "LQFP-48",
    "price_range": "\u20b9250 \u2013 \u20b9450",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f411ce.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f411ce.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 38 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32f407vg-discovery",
    "name": "STM32F407VGT6 (Discovery)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "168 MHz workhorse with Ethernet and camera interface, the classic STM32 Discovery board.",
    "long_description": "The STM32F407VG powers the long-running STM32F4-Discovery board. With Ethernet MAC, a camera interface, DSP instructions and a large SRAM, it's a favorite for more demanding embedded and signal-processing projects.",
    "clock_speed": "Up to 168 MHz",
    "flash_memory": "1 MB",
    "ram": "192 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.6V",
    "io_pins_count": 82,
    "adc_channels": "24 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-100",
    "price_range": "\u20b9500 \u2013 \u20b9900",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f407vg.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f407vg.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 24 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 82 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32f429zi-discovery",
    "name": "STM32F429ZIT6 (Discovery)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Adds a hardware LCD-TFT controller and Chrom-ART accelerator on top of the F4 line.",
    "long_description": "Building on the F4 family, the F429ZI adds an LCD-TFT controller, Chrom-ART graphics accelerator and more flash, aimed at embedded GUIs and display-heavy products while keeping the same Cortex-M4F core.",
    "clock_speed": "Up to 180 MHz",
    "flash_memory": "2 MB",
    "ram": "256 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.6V",
    "io_pins_count": 114,
    "adc_channels": "24 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-144",
    "price_range": "\u20b9700 \u2013 \u20b91200",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f429zi.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f429zi.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 24 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 114 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32f746zg-nucleo",
    "name": "STM32F746ZGT6 (Nucleo-144)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M7",
    "short_description": "Cortex-M7 core with a chunk of tightly-coupled memory for real-time DSP work.",
    "long_description": "Stepping up to a Cortex-M7 core, the F746ZG runs at 216 MHz with L1 cache and tightly-coupled memory, aimed at applications that need serious compute headroom \u2014 DSP, graphics, and high-speed control loops.",
    "clock_speed": "Up to 216 MHz",
    "flash_memory": "1 MB",
    "ram": "320 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.6V",
    "io_pins_count": 114,
    "adc_channels": "24 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,Ethernet",
    "package_type": "LQFP-144",
    "price_range": "\u20b9900 \u2013 \u20b91500",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f746zg.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f746zg.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 24 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 114 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32h743zi-nucleo",
    "name": "STM32H743ZIT6 (Nucleo-144)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M7",
    "short_description": "ST's flagship high-performance Cortex-M7, near 500 MHz with huge memory bandwidth.",
    "long_description": "The H743ZI represents ST's highest-performance single-core M7 line, running near 480 MHz with a rich memory hierarchy \u2014 used in demanding motor control, audio and industrial applications that need serious headroom.",
    "clock_speed": "Up to 480 MHz",
    "flash_memory": "2 MB",
    "ram": "1 MB SRAM",
    "operating_voltage": "1.62V \u2013 3.6V",
    "io_pins_count": 114,
    "adc_channels": "24 (16-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,Ethernet",
    "package_type": "LQFP-144",
    "price_range": "\u20b91200 \u2013 \u20b91900",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32h743zi.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32h743zi.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.62V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 24 (16-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 114 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32l476rg-nucleo",
    "name": "STM32L476RGT6 (Nucleo-64)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Ultra-low-power L4 line for battery-powered products that still need Cortex-M4 performance.",
    "long_description": "The L476RG belongs to ST's ultra-low-power L4 series, combining a Cortex-M4F core with aggressive low-power modes \u2014 a common choice for battery-powered wearables and sensor nodes that still need DSP-capable performance.",
    "clock_speed": "Up to 80 MHz",
    "flash_memory": "1 MB",
    "ram": "128 KB SRAM",
    "operating_voltage": "1.71V \u2013 3.6V",
    "io_pins_count": 51,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-64",
    "price_range": "\u20b9450 \u2013 \u20b9800",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32l476rg.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32l476rg.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.71V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 51 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32l010f4",
    "name": "STM32L010F4P6",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M0+",
    "short_description": "Tiny ultra-low-power chip aimed squarely at coin-cell sensor nodes.",
    "long_description": "A stripped-down member of ST's L0 ultra-low-power family, the L010F4 targets simple, coin-cell-powered sensor and metering applications where every microamp counts.",
    "clock_speed": "Up to 32 MHz",
    "flash_memory": "16 KB",
    "ram": "2 KB SRAM",
    "operating_voltage": "1.65V \u2013 3.6V",
    "io_pins_count": 15,
    "adc_channels": "8 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "TSSOP-20",
    "price_range": "\u20b980 \u2013 \u20b9150",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32l010f4.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32l010f4.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.65V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 15 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32g071rb-nucleo",
    "name": "STM32G071RBT6 (Nucleo-64)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M0+",
    "short_description": "Modern low-cost mainstream replacement for the aging F0 line.",
    "long_description": "The G071RB is part of ST's newer G0 value line, offering a Cortex-M0+ core with more peripherals and better power efficiency than the older F0 series, at a similarly low price point.",
    "clock_speed": "Up to 64 MHz",
    "flash_memory": "128 KB",
    "ram": "36 KB SRAM",
    "operating_voltage": "1.7V \u2013 3.6V",
    "io_pins_count": 52,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "LQFP-64",
    "price_range": "\u20b9250 \u2013 \u20b9450",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32g071rb.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32g071rb.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 52 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32g431rb-nucleo",
    "name": "STM32G431RBT6 (Nucleo-64)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Mixed-signal G4 chip tuned for motor control and digital power conversion.",
    "long_description": "The G431RB pairs a 170 MHz Cortex-M4F core with fast analog (comparators, op-amps, high-resolution timers), making the G4 series a popular choice for motor control and digital power applications.",
    "clock_speed": "Up to 170 MHz",
    "flash_memory": "128 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "1.71V \u2013 3.6V",
    "io_pins_count": 52,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-64",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32g431rb.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32g431rb.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.71V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 52 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32f030f4",
    "name": "STM32F030F4P6",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M0",
    "short_description": "Bargain-bin Cortex-M0 chip, often the cheapest way into 32-bit ARM.",
    "long_description": "The F030F4 is one of the cheapest ARM Cortex-M0 chips available, frequently used as a low-cost, low-pin-count replacement for 8-bit MCUs in cost-sensitive designs.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "16 KB",
    "ram": "4 KB SRAM",
    "operating_voltage": "2.4V \u2013 3.6V",
    "io_pins_count": 15,
    "adc_channels": "9 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "TSSOP-20",
    "price_range": "\u20b960 \u2013 \u20b9120",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f030f4.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f030f4.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.4V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 9 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 15 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32f072rb",
    "name": "STM32F072RBT6",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M0",
    "short_description": "Cortex-M0 chip with native USB device support, a step up from the base F0 line.",
    "long_description": "The F072RB adds a USB 2.0 full-speed device controller and touch-sensing support on top of the base Cortex-M0 F0 line, popular for simple USB peripherals and HID devices.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "128 KB",
    "ram": "16 KB SRAM",
    "operating_voltage": "2V \u2013 3.6V",
    "io_pins_count": 55,
    "adc_channels": "10 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-64",
    "price_range": "\u20b9200 \u2013 \u20b9380",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f072rb.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f072rb.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 55 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32f303re-nucleo",
    "name": "STM32F303RET6 (Nucleo-64)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Mixed-signal F3 chip with fast comparators and op-amps for motor control.",
    "long_description": "The F303RE is a mixed-signal member of ST's F3 family, combining a Cortex-M4F core with fast analog comparators and op-amps aimed at motor control and digital power supply designs.",
    "clock_speed": "Up to 72 MHz",
    "flash_memory": "512 KB",
    "ram": "80 KB SRAM",
    "operating_voltage": "2V \u2013 3.6V",
    "io_pins_count": 51,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-64",
    "price_range": "\u20b9400 \u2013 \u20b9700",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f303re.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f303re.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 51 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32u575zi-nucleo",
    "name": "STM32U575ZIT6Q (Nucleo-144)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M33",
    "short_description": "ST's newest ultra-low-power line with TrustZone security built in.",
    "long_description": "The U575ZI belongs to ST's U5 ultra-low-power series, built on a Cortex-M33 core with TrustZone security extensions \u2014 aimed at battery-powered products that also need a hardware root of trust.",
    "clock_speed": "Up to 160 MHz",
    "flash_memory": "2 MB",
    "ram": "768 KB SRAM",
    "operating_voltage": "1.71V \u2013 3.6V",
    "io_pins_count": 114,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-144",
    "price_range": "\u20b9700 \u2013 \u20b91100",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32u575zi.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32u575zi.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.71V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 114 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32wb55rg-nucleo",
    "name": "STM32WB55RGV6 (Nucleo-WB55)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit dual-core ARM Cortex-M4 + Cortex-M0+",
    "short_description": "Dual-core wireless SoC \u2014 an M4 for the app and an M0+ dedicated to the BLE stack.",
    "long_description": "The WB55 pairs an application-facing Cortex-M4F with a second Cortex-M0+ core that runs the Bluetooth Low Energy stack in isolation, a common architecture for certified wireless MCUs.",
    "clock_speed": "Up to 64 MHz",
    "flash_memory": "1 MB",
    "ram": "256 KB SRAM",
    "operating_voltage": "1.71V \u2013 3.6V",
    "io_pins_count": 40,
    "adc_channels": "5 (12-bit)",
    "communication": "BLE,I2C,SPI,UART,USB",
    "package_type": "VFQFPN-68",
    "price_range": "\u20b9550 \u2013 \u20b9950",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32wb55rg.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32wb55rg.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.71V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 5 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 40 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32wl55jc-nucleo",
    "name": "STM32WL55JCI6 (Nucleo-WL55JC)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit dual-core ARM Cortex-M4 + Cortex-M0+",
    "short_description": "Cortex-M4 paired with an integrated sub-GHz LoRa/FSK radio.",
    "long_description": "The WL55 integrates a sub-GHz LoRa/(G)FSK radio alongside a dual Cortex-M4F/M0+ core setup, letting a single chip run application code and a long-range radio stack without an external transceiver.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "256 KB",
    "ram": "64 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.6V",
    "io_pins_count": 43,
    "adc_channels": "12 (12-bit)",
    "communication": "LoRa,I2C,SPI,UART,USB",
    "package_type": "UFQFPN-48",
    "price_range": "\u20b9700 \u2013 \u20b91100",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32wl55jc.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32wl55jc.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 12 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 43 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32l152re-nucleo",
    "name": "STM32L152RET6 (Nucleo-64)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "Older ultra-low-power L1 line, still common in metering and low-power designs.",
    "long_description": "The L152RE is part of ST's earlier L1 ultra-low-power family, using a Cortex-M3 core with an on-chip LCD driver \u2014 still found in metering, medical and industrial low-power designs.",
    "clock_speed": "Up to 32 MHz",
    "flash_memory": "512 KB",
    "ram": "80 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.6V",
    "io_pins_count": 51,
    "adc_channels": "24 (12-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "LQFP-64",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32l152re.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32l152re.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 24 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 51 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32f103rb-nucleo",
    "name": "STM32F103RBT6 (Nucleo-64)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "The Nucleo-form-factor sibling of the famous Blue Pill chip.",
    "long_description": "Same silicon family as the Blue Pill's F103C8, but on ST's official Nucleo-64 board with more flash and onboard ST-LINK debugger \u2014 a convenient way to develop for the same chip without extra hardware.",
    "clock_speed": "Up to 72 MHz",
    "flash_memory": "128 KB",
    "ram": "20 KB SRAM",
    "operating_voltage": "2V \u2013 3.6V",
    "io_pins_count": 51,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-64",
    "price_range": "\u20b9450 \u2013 \u20b9750",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f103rb.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f103rb.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 51 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stm32f100rb",
    "name": "STM32F100RBT6B (Value Line)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "Budget \"Value Line\" Cortex-M3 with motor-control timers.",
    "long_description": "The F100 Value Line trims some peripherals from the F103 to hit a lower price point, while keeping a Cortex-M3 core and motor-control-friendly timers for cost-sensitive industrial designs.",
    "clock_speed": "Up to 24 MHz",
    "flash_memory": "128 KB",
    "ram": "8 KB SRAM",
    "operating_voltage": "2V \u2013 3.6V",
    "io_pins_count": 51,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "LQFP-64",
    "price_range": "\u20b9250 \u2013 \u20b9400",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f100rb.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f100rb.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 51 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "pic16f877a",
    "name": "PIC16F877A",
    "manufacturer": "Microchip Technology",
    "architecture": "8-bit PIC",
    "short_description": "The classic PIC that taught a generation of engineers embedded fundamentals.",
    "long_description": "The PIC16F877A is one of the most widely taught 8-bit microcontrollers, prized for its simple architecture, built-in ADC, and huge base of tutorials and university courses.",
    "clock_speed": "Up to 20 MHz",
    "flash_memory": "14 KB (8K words)",
    "ram": "368 Bytes SRAM",
    "operating_voltage": "2V \u2013 5.5V",
    "io_pins_count": 33,
    "adc_channels": "8 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "DIP-40 / TQFP-44",
    "price_range": "\u20b9120 \u2013 \u20b9250",
    "buy_url": "https://www.microchip.com/en-us/product/pic16f877a",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/39582b.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 33 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "pic18f4550",
    "name": "PIC18F4550",
    "manufacturer": "Microchip Technology",
    "architecture": "8-bit PIC",
    "short_description": "8-bit PIC with native USB 2.0, popular for USB-connected hobby projects.",
    "long_description": "The PIC18F4550 extends the PIC18 line with a native USB 2.0 full-speed device controller, making it a go-to chip for DIY USB gadgets, HID devices and USB-based data loggers.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "32 KB",
    "ram": "2 KB SRAM",
    "operating_voltage": "2V \u2013 5.5V",
    "io_pins_count": 35,
    "adc_channels": "13 (10-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "DIP-40 / TQFP-44",
    "price_range": "\u20b9150 \u2013 \u20b9300",
    "buy_url": "https://www.microchip.com/en-us/product/pic18f4550",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/39632e.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 35 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "pic24fj64ga002",
    "name": "PIC24FJ64GA002",
    "manufacturer": "Microchip Technology",
    "architecture": "16-bit PIC24",
    "short_description": "16-bit stepping stone between 8-bit PIC and 32-bit PIC32.",
    "long_description": "The PIC24FJ64GA002 brings a 16-bit core with more RAM, flash and peripherals than 8-bit PIC parts, while staying easy to move to from PIC16/18 code \u2014 a common middle step in Microchip's product line.",
    "clock_speed": "Up to 32 MHz",
    "flash_memory": "64 KB",
    "ram": "8 KB SRAM",
    "operating_voltage": "2V \u2013 3.6V",
    "io_pins_count": 21,
    "adc_channels": "9 (10-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "SPDIP-28 / QFN-28",
    "price_range": "\u20b9150 \u2013 \u20b9300",
    "buy_url": "https://www.microchip.com/en-us/product/pic24fj64ga002",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/39881e.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 21 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "pic32mx795f512l",
    "name": "PIC32MX795F512L",
    "manufacturer": "Microchip Technology",
    "architecture": "32-bit MIPS M4K",
    "short_description": "Microchip's MIPS-based 32-bit line with Ethernet and CAN built in.",
    "long_description": "Built on a MIPS M4K core rather than ARM, the PIC32MX795F512L offers Ethernet, USB and CAN on-chip, and was a common choice on chipKIT boards for networked embedded projects.",
    "clock_speed": "Up to 80 MHz",
    "flash_memory": "512 KB",
    "ram": "128 KB SRAM",
    "operating_voltage": "2.3V \u2013 3.6V",
    "io_pins_count": 85,
    "adc_channels": "16 (10-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,Ethernet",
    "package_type": "TQFP-100",
    "price_range": "\u20b9500 \u2013 \u20b9850",
    "buy_url": "https://www.microchip.com/en-us/product/pic32mx795f512l",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/61156H.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.3V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 85 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "pic32mz2048efh144",
    "name": "PIC32MZ2048EFH144",
    "manufacturer": "Microchip Technology",
    "architecture": "32-bit MIPS microAptiv",
    "short_description": "Microchip's high-performance 32-bit line, with hardware floating point and crypto engine.",
    "long_description": "The PIC32MZ EF series pushes MIPS performance further, adding a hardware floating point unit and a crypto engine \u2014 used in higher-end industrial and connectivity products that stay on the MIPS ecosystem.",
    "clock_speed": "Up to 252 MHz",
    "flash_memory": "2 MB",
    "ram": "512 KB SRAM",
    "operating_voltage": "2.1V \u2013 3.6V",
    "io_pins_count": 90,
    "adc_channels": "24 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,Ethernet",
    "package_type": "TQFP-144",
    "price_range": "\u20b9700 \u2013 \u20b91200",
    "buy_url": "https://www.microchip.com/en-us/product/pic32mz2048efh144",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/60001320G.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.1V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 24 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 90 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "atmega2560-mega",
    "name": "ATmega2560 (Arduino Mega 2560)",
    "manufacturer": "Microchip",
    "architecture": "8-bit AVR",
    "short_description": "The high-pin-count AVR for projects that outgrow the Uno's 20 I/O pins.",
    "long_description": "The ATmega2560 keeps the familiar 8-bit AVR core and Arduino tooling of the Uno, but adds far more flash, RAM and I/O pins \u2014 used when a project needs many sensors, motors or displays at once.",
    "clock_speed": "16 MHz",
    "flash_memory": "256 KB",
    "ram": "8 KB SRAM",
    "operating_voltage": "5V",
    "io_pins_count": 54,
    "adc_channels": "16 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "TQFP-100",
    "price_range": "\u20b9550 \u2013 \u20b9950",
    "buy_url": "https://store.arduino.cc/products/arduino-mega-2560-rev3",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/ATmega2560-Datasheet.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 54 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "atmega32u4-leonardo",
    "name": "ATmega32U4 (Arduino Leonardo / Pro Micro)",
    "manufacturer": "Microchip",
    "architecture": "8-bit AVR",
    "short_description": "AVR chip with native USB, letting the board present itself as a keyboard, mouse or MIDI device.",
    "long_description": "Unlike the Uno's ATmega328P, the ATmega32U4 has built-in USB, letting Leonardo and Pro Micro boards enumerate directly as a USB HID device \u2014 popular for custom keyboards, controllers and MIDI gear.",
    "clock_speed": "16 MHz",
    "flash_memory": "32 KB",
    "ram": "2.5 KB SRAM",
    "operating_voltage": "5V",
    "io_pins_count": 20,
    "adc_channels": "12 (10-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "TQFP-44",
    "price_range": "\u20b9250 \u2013 \u20b9450",
    "buy_url": "https://store.arduino.cc/products/arduino-leonardo-with-headers",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/ATmega16U4-32U4-DataSheet-40002074A.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 20 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "atmega4809-nano-every",
    "name": "ATmega4809 (Arduino Nano Every)",
    "manufacturer": "Microchip",
    "architecture": "8-bit AVR (megaAVR 0-series)",
    "short_description": "Modern megaAVR core in the classic Nano footprint, faster than the original Nano.",
    "long_description": "The ATmega4809 belongs to Microchip's newer megaAVR 0-series, offering a more capable core, Event System and flexible peripherals while remaining pin-compatible with classic AVR Arduino boards.",
    "clock_speed": "Up to 20 MHz",
    "flash_memory": "48 KB",
    "ram": "6 KB SRAM",
    "operating_voltage": "1.8V \u2013 5.5V",
    "io_pins_count": 22,
    "adc_channels": "8 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "TQFP-32",
    "price_range": "\u20b9300 \u2013 \u20b9500",
    "buy_url": "https://store.arduino.cc/products/arduino-nano-every",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/megaAVR0-series-Summary-DataSheet-DS40002015.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 22 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "atmega128",
    "name": "ATmega128",
    "manufacturer": "Microchip",
    "architecture": "8-bit AVR",
    "short_description": "Older high-pin-count AVR, once common in robotics kits before the Mega2560.",
    "long_description": "A predecessor to the ATmega2560, the ATmega128 was widely used in robotics and industrial 8-bit designs needing more memory and I/O than the smaller AVR chips could offer.",
    "clock_speed": "Up to 16 MHz",
    "flash_memory": "128 KB",
    "ram": "4 KB SRAM",
    "operating_voltage": "4.5V \u2013 5.5V",
    "io_pins_count": 53,
    "adc_channels": "8 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "TQFP-64",
    "price_range": "\u20b9300 \u2013 \u20b9550",
    "buy_url": "https://www.microchip.com/en-us/product/atmega128",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/doc2467.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (4.5V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 53 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "attiny13a",
    "name": "ATtiny13A",
    "manufacturer": "Microchip",
    "architecture": "8-bit AVR",
    "short_description": "One of the smallest, cheapest AVRs \u2014 barely enough resources to blink an LED cleverly.",
    "long_description": "With just 1 KB of flash and 64 bytes of RAM, the ATtiny13A is used for the simplest possible embedded tasks \u2014 status LEDs, tiny timers, and cost-critical single-function gadgets.",
    "clock_speed": "Up to 20 MHz (9.6 MHz internal typical)",
    "flash_memory": "1 KB",
    "ram": "64 Bytes SRAM",
    "operating_voltage": "1.8V \u2013 5.5V",
    "io_pins_count": 6,
    "adc_channels": "4 (10-bit)",
    "communication": "I2C (USI),SPI (USI)",
    "package_type": "DIP-8 / SOIC-8",
    "price_range": "\u20b940 \u2013 \u20b990",
    "buy_url": "https://www.microchip.com/en-us/product/attiny13a",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/doc2535.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "5",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "6",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "7",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 6 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "8",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "attiny2313",
    "name": "ATtiny2313",
    "manufacturer": "Microchip",
    "architecture": "8-bit AVR",
    "short_description": "Small 20-pin AVR popular for simple state-machine and glue-logic projects.",
    "long_description": "The ATtiny2313 offers more I/O than the ATtiny85/13 in a compact 20-pin package, often used for small state machines, simple serial gadgets and glue logic between other chips.",
    "clock_speed": "Up to 20 MHz",
    "flash_memory": "2 KB",
    "ram": "128 Bytes SRAM",
    "operating_voltage": "1.8V \u2013 5.5V",
    "io_pins_count": 18,
    "adc_channels": "0 (none)",
    "communication": "I2C (USI),SPI (USI),UART",
    "package_type": "DIP-20 / SOIC-20",
    "price_range": "\u20b960 \u2013 \u20b9120",
    "buy_url": "https://www.microchip.com/en-us/product/attiny2313",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/doc2543.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 18 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "attiny404",
    "name": "ATtiny404",
    "manufacturer": "Microchip",
    "architecture": "8-bit AVR (tinyAVR 0-series)",
    "short_description": "Modern tinyAVR replacement for classic ATtiny parts with a better peripheral set.",
    "long_description": "Part of Microchip's newer tinyAVR 0-series, the ATtiny404 modernizes the small-AVR lineup with a more flexible peripheral set and Core Independent Peripherals, while staying cheap and small.",
    "clock_speed": "Up to 20 MHz",
    "flash_memory": "4 KB",
    "ram": "256 Bytes SRAM",
    "operating_voltage": "1.8V \u2013 5.5V",
    "io_pins_count": 12,
    "adc_channels": "6 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "SOIC-14 / QFN-14",
    "price_range": "\u20b960 \u2013 \u20b9110",
    "buy_url": "https://www.microchip.com/en-us/product/attiny404",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/40001909A.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 12 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "at90usb1286",
    "name": "AT90USB1286",
    "manufacturer": "Microchip",
    "architecture": "8-bit AVR",
    "short_description": "High-memory AVR with native USB, used in early open-source USB-MIDI and bootloader projects.",
    "long_description": "The AT90USB1286 combines a full-size AVR core with native USB 2.0, and was widely used in open hardware USB-MIDI interfaces and as the USB bootloader chip on several DIY keyboard controllers.",
    "clock_speed": "Up to 16 MHz",
    "flash_memory": "128 KB",
    "ram": "8 KB SRAM",
    "operating_voltage": "2.7V \u2013 5.5V",
    "io_pins_count": 48,
    "adc_channels": "8 (10-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "TQFP-64",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.microchip.com/en-us/product/at90usb1286",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/doc7593.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.7V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 48 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "dspic33fj128mc804",
    "name": "dsPIC33FJ128MC804",
    "manufacturer": "Microchip Technology",
    "architecture": "16-bit Digital Signal Controller",
    "short_description": "16-bit DSC combining MCU control with DSP instructions for motor control.",
    "long_description": "A digital signal controller rather than a plain MCU, the dsPIC33FJ128MC804 blends general-purpose control with DSP-style instructions, commonly used in motor control and power conversion designs.",
    "clock_speed": "Up to 40 MIPS",
    "flash_memory": "128 KB",
    "ram": "16 KB SRAM",
    "operating_voltage": "3V \u2013 3.6V",
    "io_pins_count": 18,
    "adc_channels": "9 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "TQFP-28",
    "price_range": "\u20b9300 \u2013 \u20b9500",
    "buy_url": "https://www.microchip.com/en-us/product/dspic33fj128mc804",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/70291G.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 18 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "samd21g18-zero",
    "name": "ATSAMD21G18 (Arduino Zero / Feather M0)",
    "manufacturer": "Microchip",
    "architecture": "32-bit ARM Cortex-M0+",
    "short_description": "ARM Cortex-M0+ that brought native USB and 32-bit headroom to Arduino-shaped boards.",
    "long_description": "The SAMD21G18 sits at the heart of the Arduino Zero and many Adafruit Feather M0 boards, offering a Cortex-M0+ core, native USB, and a real 32-bit toolchain while keeping the familiar Arduino form factor.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "256 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "1.62V \u2013 3.63V",
    "io_pins_count": 38,
    "adc_channels": "20 (12-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "TQFP-48",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.microchip.com/en-us/product/atsamd21g18",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/SAM_D21_DA1_Family_DataSheet_DS40001882F.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.62V \u2013 3.63V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 38 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "sam3x8e-due",
    "name": "AT91SAM3X8E (Arduino Due)",
    "manufacturer": "Microchip",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "The first official 32-bit Arduino, running at 5x the Uno's clock speed.",
    "long_description": "The SAM3X8E powers the Arduino Due, the first mainline Arduino board built around a 32-bit ARM Cortex-M3 core, offering far more RAM, flash and I/O than 8-bit AVR-based boards.",
    "clock_speed": "84 MHz",
    "flash_memory": "512 KB",
    "ram": "96 KB SRAM",
    "operating_voltage": "3.3V (5V tolerant I/O)",
    "io_pins_count": 54,
    "adc_channels": "12 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-144",
    "price_range": "\u20b91200 \u2013 \u20b91800",
    "buy_url": "https://store.arduino.cc/products/arduino-due",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-11057-32-bit-Cortex-M3-Microcontroller-SAM3X-SAM3A_Datasheet.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V tolerant I/O))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 12 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 54 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "same70q21-xplained",
    "name": "ATSAME70Q21 (SAM E70 Xplained)",
    "manufacturer": "Microchip",
    "architecture": "32-bit ARM Cortex-M7",
    "short_description": "Microchip's high-performance Cortex-M7 with Ethernet and a CAN-FD controller.",
    "long_description": "The SAME70Q21 pushes Microchip's Cortex-M7 line to 300 MHz with Ethernet MAC and CAN-FD, aimed at industrial and connectivity products that need serious throughput.",
    "clock_speed": "Up to 300 MHz",
    "flash_memory": "2 MB",
    "ram": "384 KB SRAM",
    "operating_voltage": "1.62V \u2013 3.6V",
    "io_pins_count": 114,
    "adc_channels": "24 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,Ethernet",
    "package_type": "LQFP-144",
    "price_range": "\u20b9900 \u2013 \u20b91400",
    "buy_url": "https://www.microchip.com/en-us/product/atsame70q21",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/SAM-E70-S70-V70-V71-Family-Data-Sheet-DS60001527.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.62V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 24 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 114 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "sam4s16c",
    "name": "ATSAM4S16C",
    "manufacturer": "Microchip",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Cortex-M4 line from the former Atmel SAM4S family, common in metering and industrial gear.",
    "long_description": "The SAM4S16C offers a Cortex-M4 core with a flexible memory system and a comparatively low price, and is commonly found in industrial control and metering products.",
    "clock_speed": "Up to 120 MHz",
    "flash_memory": "1 MB",
    "ram": "128 KB SRAM",
    "operating_voltage": "1.62V \u2013 3.6V",
    "io_pins_count": 79,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-100",
    "price_range": "\u20b9450 \u2013 \u20b9750",
    "buy_url": "https://www.microchip.com/en-us/product/atsam4s16c",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-11100-32-bit-Cortex-M4-Microcontroller-SAM4S_Datasheet.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.62V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 79 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "atsamd51-feather-m4",
    "name": "ATSAMD51J19 (Adafruit Feather M4)",
    "manufacturer": "Microchip",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "The faster 120 MHz sibling of the SAMD21, used on Adafruit's Feather M4 boards.",
    "long_description": "The SAMD51 line steps up from the SAMD21 with a Cortex-M4F core, more RAM and DSP instructions, while staying pin-compatible in spirit with earlier SAMD-based Feather boards.",
    "clock_speed": "Up to 120 MHz",
    "flash_memory": "512 KB",
    "ram": "192 KB SRAM",
    "operating_voltage": "2.7V \u2013 3.63V",
    "io_pins_count": 40,
    "adc_channels": "20 (12-bit)",
    "communication": "I2C,SPI,UART,USB,I2S",
    "package_type": "TQFP-64",
    "price_range": "\u20b9700 \u2013 \u20b91100",
    "buy_url": "https://www.microchip.com/en-us/product/atsamd51j19a",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/60001507C.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.7V \u2013 3.63V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 40 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "lpc1768-mbed",
    "name": "LPC1768 (mbed)",
    "manufacturer": "NXP Semiconductors",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "The chip behind the original mbed platform, once a default choice for prototyping.",
    "long_description": "The LPC1768 was the reference chip for the original ARM mbed online platform, offering Ethernet, USB and CAN on a Cortex-M3 core, and remains common in university and prototyping projects.",
    "clock_speed": "Up to 100 MHz",
    "flash_memory": "512 KB",
    "ram": "64 KB SRAM",
    "operating_voltage": "2.4V \u2013 3.6V",
    "io_pins_count": 70,
    "adc_channels": "8 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,Ethernet",
    "package_type": "LQFP-100",
    "price_range": "\u20b9500 \u2013 \u20b9850",
    "buy_url": "https://www.nxp.com/products/LPC1768FBD100",
    "datasheet_url": "https://www.nxp.com/docs/en/data-sheet/LPC1769_68_67_66_65_64_63.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.4V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 70 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "lpc824m201",
    "name": "LPC824M201",
    "manufacturer": "NXP Semiconductors",
    "architecture": "32-bit ARM Cortex-M0+",
    "short_description": "Low-cost Cortex-M0+ with NXP's switch matrix for flexible pin assignment.",
    "long_description": "The LPC824 offers a low-cost Cortex-M0+ core with NXP's switch matrix peripheral, which lets almost any peripheral function be routed to almost any pin \u2014 useful when board layout constraints are tight.",
    "clock_speed": "Up to 30 MHz",
    "flash_memory": "32 KB",
    "ram": "8 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.6V",
    "io_pins_count": 29,
    "adc_channels": "12 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "TSSOP-28 / HVQFN-33",
    "price_range": "\u20b9100 \u2013 \u20b9200",
    "buy_url": "https://www.nxp.com/products/LPC824M201",
    "datasheet_url": "https://www.nxp.com/docs/en/data-sheet/LPC82X.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 12 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 29 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "mkl25z128-frdm",
    "name": "MKL25Z128VLK4 (FRDM-KL25Z)",
    "manufacturer": "NXP Semiconductors",
    "architecture": "32-bit ARM Cortex-M0+",
    "short_description": "NXP's entry-level Freedom board chip, a common first taste of the Kinetis family.",
    "long_description": "The MKL25Z128 anchors NXP's original FRDM-KL25Z Freedom board, a low-cost Cortex-M0+ chip often used as an introduction to the broader Kinetis microcontroller family.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "128 KB",
    "ram": "16 KB SRAM",
    "operating_voltage": "1.71V \u2013 3.6V",
    "io_pins_count": 42,
    "adc_channels": "16 (16-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "LQFP-48",
    "price_range": "\u20b9250 \u2013 \u20b9450",
    "buy_url": "https://www.nxp.com/products/MKL25Z128VLK4",
    "datasheet_url": "https://www.nxp.com/docs/en/data-sheet/KL25P80M48SF0.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.71V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (16-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 42 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "mk64fn1m0-frdm",
    "name": "MK64FN1M0VLL12 (FRDM-K64F)",
    "manufacturer": "NXP Semiconductors",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Kinetis K64 chip with Ethernet, a common target for early mbed OS and IoT prototyping.",
    "long_description": "The K64F pairs a Cortex-M4F core with Ethernet and USB, and was a widely used reference target for ARM mbed OS during the early wave of IoT prototyping boards.",
    "clock_speed": "Up to 120 MHz",
    "flash_memory": "1 MB",
    "ram": "256 KB SRAM",
    "operating_voltage": "1.71V \u2013 3.6V",
    "io_pins_count": 90,
    "adc_channels": "24 (16-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,Ethernet",
    "package_type": "LQFP-144",
    "price_range": "\u20b9700 \u2013 \u20b91100",
    "buy_url": "https://www.nxp.com/products/MK64FN1M0VLL12",
    "datasheet_url": "https://www.nxp.com/docs/en/data-sheet/K64P144M120SF5.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.71V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 24 (16-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 90 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "imxrt1062-teensy41",
    "name": "i.MX RT1062 (Teensy 4.1)",
    "manufacturer": "NXP Semiconductors",
    "architecture": "32-bit ARM Cortex-M7",
    "short_description": "A screaming-fast 600 MHz Cortex-M7 crossover chip on the tiny Teensy 4.1 board.",
    "long_description": "The i.MX RT1062 is a \"crossover\" MCU that clocks a Cortex-M7 core up to 600 MHz \u2014 extreme for a hobbyist board \u2014 and is the heart of the popular Teensy 4.1, used for audio DSP, high-speed control and camera work.",
    "clock_speed": "Up to 600 MHz",
    "flash_memory": "Up to 8 MB (external QSPI flash)",
    "ram": "1 MB SRAM (+512KB tightly coupled)",
    "operating_voltage": "1.8V \u2013 3.6V (board: 3.3V/5V via USB)",
    "io_pins_count": 55,
    "adc_channels": "18 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,Ethernet",
    "package_type": "BGA-196 (module on board)",
    "price_range": "\u20b91800 \u2013 \u20b92800",
    "buy_url": "https://www.pjrc.com/store/teensy41.html",
    "datasheet_url": "https://www.nxp.com/docs/en/data-sheet/IMXRT1060CEC.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.6V (board: 3.3V/5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 18 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 55 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "lpc55s69",
    "name": "LPC55S69",
    "manufacturer": "NXP Semiconductors",
    "architecture": "32-bit dual-core ARM Cortex-M33",
    "short_description": "Dual Cortex-M33 chip with TrustZone and a hardware crypto/DSP co-processor.",
    "long_description": "The LPC55S69 packs two Cortex-M33 cores with TrustZone security and an optional DSP/crypto co-processor, aimed at IoT products that need secure boot and dual-core task separation.",
    "clock_speed": "Up to 150 MHz",
    "flash_memory": "640 KB",
    "ram": "320 KB SRAM",
    "operating_voltage": "1.62V \u2013 3.6V",
    "io_pins_count": 64,
    "adc_channels": "12 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-100",
    "price_range": "\u20b9500 \u2013 \u20b9850",
    "buy_url": "https://www.nxp.com/products/LPC55S69",
    "datasheet_url": "https://www.nxp.com/docs/en/data-sheet/LPC55S6x.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.62V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 12 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 64 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "s32k144",
    "name": "S32K144",
    "manufacturer": "NXP Semiconductors",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Automotive-grade Cortex-M4 aimed at body electronics and general automotive control.",
    "long_description": "The S32K144 is an automotive-qualified Cortex-M4F chip built for body control modules and general automotive electronics, with CAN-FD and safety features baked in.",
    "clock_speed": "Up to 112 MHz",
    "flash_memory": "512 KB",
    "ram": "64 KB SRAM",
    "operating_voltage": "3V \u2013 5.5V",
    "io_pins_count": 96,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,CAN",
    "package_type": "LQFP-100",
    "price_range": "\u20b9450 \u2013 \u20b9750",
    "buy_url": "https://www.nxp.com/products/S32K144",
    "datasheet_url": "https://www.nxp.com/docs/en/data-sheet/S32K1XXDS.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "10",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 96 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "mke04z8",
    "name": "MKE04Z8VTG4 (Kinetis E)",
    "manufacturer": "NXP Semiconductors",
    "architecture": "32-bit ARM Cortex-M0+",
    "short_description": "Rugged low-cost Kinetis E chip built for high-voltage industrial environments.",
    "long_description": "Part of NXP's Kinetis E family, the MKE04Z8 is built for robustness in noisy, high-voltage industrial environments while remaining a simple, low-cost Cortex-M0+ chip.",
    "clock_speed": "Up to 20 MHz",
    "flash_memory": "8 KB",
    "ram": "1 KB SRAM",
    "operating_voltage": "2.7V \u2013 5.5V",
    "io_pins_count": 21,
    "adc_channels": "12 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "LQFP-32",
    "price_range": "\u20b9120 \u2013 \u20b9220",
    "buy_url": "https://www.nxp.com/products/MKE04Z8VTG4",
    "datasheet_url": "https://www.nxp.com/docs/en/data-sheet/MKE04P24M20SF0.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.7V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 12 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 21 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "msp430g2553",
    "name": "MSP430G2553",
    "manufacturer": "Texas Instruments",
    "architecture": "16-bit MSP430",
    "short_description": "The chip on the classic $9 LaunchPad, famous for ultra-low sleep currents.",
    "long_description": "The MSP430G2553 became a hobbyist favorite via TI's inexpensive LaunchPad, prized for extremely low sleep-mode current draw and a simple 16-bit RISC-like instruction set, ideal for battery-powered sensors.",
    "clock_speed": "Up to 16 MHz",
    "flash_memory": "16 KB",
    "ram": "512 Bytes SRAM",
    "operating_voltage": "1.8V \u2013 3.6V",
    "io_pins_count": 24,
    "adc_channels": "8 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "PDIP-20 / TSSOP-28",
    "price_range": "\u20b980 \u2013 \u20b9150",
    "buy_url": "https://www.ti.com/product/MSP430G2553",
    "datasheet_url": "https://www.ti.com/lit/ds/symlink/msp430g2553.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 24 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "msp430fr2433",
    "name": "MSP430FR2433",
    "manufacturer": "Texas Instruments",
    "architecture": "16-bit MSP430 (FRAM)",
    "short_description": "FRAM-based MSP430 offering fast, low-energy non-volatile memory writes.",
    "long_description": "The FR2433 swaps traditional flash for FRAM, giving near-instant, low-energy writes to non-volatile memory \u2014 useful for data logging applications that write frequently on a tight power budget.",
    "clock_speed": "Up to 24 MHz",
    "flash_memory": "16 KB FRAM",
    "ram": "4 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.6V",
    "io_pins_count": 21,
    "adc_channels": "8 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "TSSOP-20 / VQFN-24",
    "price_range": "\u20b9100 \u2013 \u20b9180",
    "buy_url": "https://www.ti.com/product/MSP430FR2433",
    "datasheet_url": "https://www.ti.com/lit/ds/symlink/msp430fr2433.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 21 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "msp430f5529",
    "name": "MSP430F5529",
    "manufacturer": "Texas Instruments",
    "architecture": "16-bit MSP430",
    "short_description": "USB-capable MSP430 popular for low-power instrumentation projects.",
    "long_description": "The F5529 extends the MSP430 line with a USB 2.0 interface and more memory, commonly used in low-power instrumentation and data acquisition designs that need a direct USB connection.",
    "clock_speed": "Up to 25 MHz",
    "flash_memory": "128 KB",
    "ram": "8 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.6V",
    "io_pins_count": 63,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "LQFP-80",
    "price_range": "\u20b9300 \u2013 \u20b9500",
    "buy_url": "https://www.ti.com/product/MSP430F5529",
    "datasheet_url": "https://www.ti.com/lit/ds/symlink/msp430f5529.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 63 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "tm4c123gh6pm-launchpad",
    "name": "TM4C123GH6PM (Tiva C LaunchPad)",
    "manufacturer": "Texas Instruments",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "TI's mainstream Cortex-M4 LaunchPad chip, a common classroom board for embedded courses.",
    "long_description": "The TM4C123GH6PM anchors TI's Tiva C LaunchPad, a popular teaching platform pairing a solid Cortex-M4F core with an easy-to-use free toolchain and plenty of example code.",
    "clock_speed": "Up to 80 MHz",
    "flash_memory": "256 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "3.3V (5V tolerant I/O)",
    "io_pins_count": 43,
    "adc_channels": "12 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-100",
    "price_range": "\u20b9450 \u2013 \u20b9750",
    "buy_url": "https://www.ti.com/product/TM4C123GH6PM",
    "datasheet_url": "https://www.ti.com/lit/ds/symlink/tm4c123gh6pm.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V tolerant I/O))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 12 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 43 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "cc2652r-launchxl",
    "name": "CC2652R (SimpleLink)",
    "manufacturer": "Texas Instruments",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Multi-protocol wireless MCU that can run BLE, Zigbee, Thread and sub-GHz on one chip.",
    "long_description": "The CC2652R combines an application Cortex-M4F with a dedicated radio core capable of concurrently running BLE, Zigbee, Thread and proprietary sub-GHz protocols \u2014 common in smart-home hubs.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "352 KB",
    "ram": "80 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.8V",
    "io_pins_count": 31,
    "adc_channels": "8 (12-bit)",
    "communication": "BLE,Zigbee,Thread,I2C,SPI,UART",
    "package_type": "VQFN-48 / RGZ-48",
    "price_range": "\u20b9450 \u2013 \u20b9800",
    "buy_url": "https://www.ti.com/product/CC2652R",
    "datasheet_url": "https://www.ti.com/lit/ds/symlink/cc2652r.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.8V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 31 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "msp432p401r-launchpad",
    "name": "MSP432P401R (LaunchPad)",
    "manufacturer": "Texas Instruments",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "32-bit successor to the MSP430 line, keeping the low-power heritage on a Cortex-M4F core.",
    "long_description": "MSP432 brings TI's ultra-low-power heritage to a 32-bit Cortex-M4F core, aimed at applications that outgrew the 16-bit MSP430 but still need aggressive power management.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "256 KB",
    "ram": "64 KB SRAM",
    "operating_voltage": "1.62V \u2013 3.7V",
    "io_pins_count": 84,
    "adc_channels": "24 (14-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "LQFP-100",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.ti.com/product/MSP432P401R",
    "datasheet_url": "https://www.ti.com/lit/ds/symlink/msp432p401r.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.62V \u2013 3.7V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 24 (14-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 84 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "cc1310-launchxl",
    "name": "CC1310",
    "manufacturer": "Texas Instruments",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "Sub-GHz wireless MCU built for long-range, low-power point-to-point links.",
    "long_description": "The CC1310 pairs a Cortex-M3 with a sub-GHz radio core aimed at long-range, low-power applications like smart metering and remote sensor links where BLE/WiFi range isn't enough.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "128 KB",
    "ram": "20 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.8V",
    "io_pins_count": 30,
    "adc_channels": "8 (12-bit)",
    "communication": "Sub-GHz RF,I2C,SPI,UART",
    "package_type": "VQFN-48 / RGZ-48",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.ti.com/product/CC1310",
    "datasheet_url": "https://www.ti.com/lit/ds/symlink/cc1310.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.8V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 30 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "esp32-s3-devkit",
    "name": "ESP32-S3",
    "manufacturer": "Espressif Systems",
    "architecture": "32-bit dual-core Xtensa LX7",
    "short_description": "Successor to the ESP32 with an AI-acceleration instruction set and native USB.",
    "long_description": "The ESP32-S3 keeps Wi-Fi + BLE while upgrading to dual Xtensa LX7 cores with vector instructions aimed at lightweight AI/ML inference, plus native USB OTG \u2014 a common pick for camera and voice IoT projects.",
    "clock_speed": "Up to 240 MHz",
    "flash_memory": "8 MB (typical dev board)",
    "ram": "512 KB SRAM (+ PSRAM option)",
    "operating_voltage": "3.3V",
    "io_pins_count": 45,
    "adc_channels": "20 (12-bit)",
    "communication": "WiFi,BLE,I2C,SPI,UART,USB",
    "package_type": "QFN-56 (module on dev board)",
    "price_range": "\u20b9350 \u2013 \u20b9700",
    "buy_url": "https://www.espressif.com/en/products/socs/esp32-s3",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 45 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "esp32-c3-devkit",
    "name": "ESP32-C3",
    "manufacturer": "Espressif Systems",
    "architecture": "32-bit single-core RISC-V",
    "short_description": "Espressif's first mainstream RISC-V chip, a cheaper single-core Wi-Fi + BLE option.",
    "long_description": "The ESP32-C3 swaps Xtensa for a single-core RISC-V design, trimming cost and power while keeping Wi-Fi and BLE 5 \u2014 a popular lower-cost alternative to the ESP32 for simpler IoT nodes.",
    "clock_speed": "Up to 160 MHz",
    "flash_memory": "4 MB (typical dev board)",
    "ram": "400 KB SRAM",
    "operating_voltage": "3.3V",
    "io_pins_count": 22,
    "adc_channels": "6 (12-bit)",
    "communication": "WiFi,BLE,I2C,SPI,UART",
    "package_type": "QFN-32 (module on dev board)",
    "price_range": "\u20b9200 \u2013 \u20b9400",
    "buy_url": "https://www.espressif.com/en/products/socs/esp32-c3",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32-c3_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 6 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 22 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "esp32-c6-devkit",
    "name": "ESP32-C6",
    "manufacturer": "Espressif Systems",
    "architecture": "32-bit RISC-V (dual-core: HP + LP)",
    "short_description": "First ESP32 with Wi-Fi 6, plus BLE 5 and 802.15.4 for Zigbee/Thread on one chip.",
    "long_description": "The ESP32-C6 adds Wi-Fi 6 support alongside BLE 5 and an 802.15.4 radio for Zigbee/Thread, letting one chip bridge Wi-Fi, Bluetooth and mesh protocols for smart-home gateway designs.",
    "clock_speed": "Up to 160 MHz",
    "flash_memory": "4 MB (typical dev board)",
    "ram": "512 KB SRAM",
    "operating_voltage": "3.3V",
    "io_pins_count": 30,
    "adc_channels": "7 (12-bit)",
    "communication": "WiFi,BLE,Zigbee,Thread,I2C,SPI,UART",
    "package_type": "QFN-40 (module on dev board)",
    "price_range": "\u20b9300 \u2013 \u20b9550",
    "buy_url": "https://www.espressif.com/en/products/socs/esp32-c6",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32-c6_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 7 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 30 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "esp32-s2-devkit",
    "name": "ESP32-S2",
    "manufacturer": "Espressif Systems",
    "architecture": "32-bit single-core Xtensa LX7",
    "short_description": "Wi-Fi-only ESP32 variant with native USB OTG and no Bluetooth radio.",
    "long_description": "The ESP32-S2 drops Bluetooth entirely in favor of a simpler single-core design with native USB OTG, aimed at Wi-Fi-only products (and USB dongles) that don't need BLE.",
    "clock_speed": "Up to 240 MHz",
    "flash_memory": "4 MB (typical dev board)",
    "ram": "320 KB SRAM",
    "operating_voltage": "3.3V",
    "io_pins_count": 43,
    "adc_channels": "20 (13-bit)",
    "communication": "WiFi,I2C,SPI,UART,USB",
    "package_type": "QFN-56 (module on dev board)",
    "price_range": "\u20b9300 \u2013 \u20b9550",
    "buy_url": "https://www.espressif.com/en/products/socs/esp32-s2",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32-s2_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 43 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "esp32-wroom-32d",
    "name": "ESP32-WROOM-32D",
    "manufacturer": "Espressif Systems",
    "architecture": "32-bit Xtensa LX6 (dual-core)",
    "short_description": "The most common ESP32 module footprint, found on countless dev boards.",
    "long_description": "The WROOM-32D module packages the base ESP32 chip with flash, antenna and shielding into the module form factor used across the vast majority of ESP32 dev boards on the market.",
    "clock_speed": "Up to 240 MHz",
    "flash_memory": "4 MB",
    "ram": "520 KB SRAM",
    "operating_voltage": "3.0V \u2013 3.6V",
    "io_pins_count": 34,
    "adc_channels": "18 (12-bit)",
    "communication": "WiFi,BLE,I2C,SPI,UART,I2S",
    "package_type": "SMD Module (16mm x 18mm)",
    "price_range": "\u20b9200 \u2013 \u20b9400",
    "buy_url": "https://www.espressif.com/en/products/modules/esp32",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32d_esp32-wroom-32u_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.0V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 18 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 34 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "esp8285",
    "name": "ESP8285",
    "manufacturer": "Espressif Systems",
    "architecture": "32-bit Tensilica L106",
    "short_description": "ESP8266 with 1MB flash baked into the same package, cutting board space and cost.",
    "long_description": "The ESP8285 is essentially an ESP8266 with 1 MB of flash integrated into the chip package itself, removing the need for an external flash chip and slightly shrinking board designs.",
    "clock_speed": "80 MHz (up to 160 MHz)",
    "flash_memory": "1 MB (embedded)",
    "ram": "~80 KB usable",
    "operating_voltage": "3.3V",
    "io_pins_count": 17,
    "adc_channels": "1 (10-bit)",
    "communication": "WiFi,I2C,SPI,UART",
    "package_type": "QFN-32",
    "price_range": "\u20b9120 \u2013 \u20b9250",
    "buy_url": "https://www.espressif.com/en/products/socs/esp8285",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/0a-esp8285_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 17 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "esp32-h2-devkit",
    "name": "ESP32-H2",
    "manufacturer": "Espressif Systems",
    "architecture": "32-bit single-core RISC-V",
    "short_description": "A Thread/Zigbee/BLE specialist chip from Espressif with no Wi-Fi radio at all.",
    "long_description": "The ESP32-H2 deliberately leaves out Wi-Fi, focusing purely on 802.15.4 (Thread/Zigbee) and BLE \u2014 intended as a low-power mesh/BLE endpoint chip that pairs with a Wi-Fi-capable ESP32 elsewhere on the network.",
    "clock_speed": "Up to 96 MHz",
    "flash_memory": "4 MB (typical dev board)",
    "ram": "256 KB SRAM",
    "operating_voltage": "3.3V",
    "io_pins_count": 22,
    "adc_channels": "5 (12-bit)",
    "communication": "BLE,Zigbee,Thread,I2C,SPI,UART",
    "package_type": "QFN-32 (module on dev board)",
    "price_range": "\u20b9250 \u2013 \u20b9450",
    "buy_url": "https://www.espressif.com/en/products/socs/esp32-h2",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32-h2_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 5 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 22 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "esp32-c2-devkit",
    "name": "ESP32-C2",
    "manufacturer": "Espressif Systems",
    "architecture": "32-bit single-core RISC-V",
    "short_description": "Espressif's cost-reduced RISC-V chip aimed squarely at high-volume Wi-Fi/BLE products.",
    "long_description": "The ESP32-C2 strips the C3 down further to hit an even lower price point, aimed at high-volume, cost-sensitive Wi-Fi + BLE products where every peripheral costs money.",
    "clock_speed": "Up to 120 MHz",
    "flash_memory": "2 MB (typical dev board)",
    "ram": "272 KB SRAM",
    "operating_voltage": "3.3V",
    "io_pins_count": 14,
    "adc_channels": "5 (12-bit)",
    "communication": "WiFi,BLE,I2C,SPI,UART",
    "package_type": "QFN-24 (module on dev board)",
    "price_range": "\u20b9150 \u2013 \u20b9300",
    "buy_url": "https://www.espressif.com/en/products/socs/esp32-c2",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp8684_esp32-c2_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 5 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 14 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "m5stack-core-esp32",
    "name": "M5Stack Core (ESP32)",
    "manufacturer": "M5Stack / Espressif",
    "architecture": "32-bit dual-core Xtensa LX6",
    "short_description": "A stacked, cased ESP32 dev kit with a built-in screen, battery and modular header.",
    "long_description": "M5Stack Core wraps a base ESP32 in a compact, cased unit with a color LCD, battery and speaker, plus a stackable module system \u2014 popular for quick IoT prototyping without wiring a breadboard.",
    "clock_speed": "Up to 240 MHz",
    "flash_memory": "16 MB",
    "ram": "520 KB SRAM",
    "operating_voltage": "3.3V (5V via USB/battery)",
    "io_pins_count": 26,
    "adc_channels": "12 (12-bit)",
    "communication": "WiFi,BLE,I2C,SPI,UART",
    "package_type": "Cased module",
    "price_range": "\u20b91800 \u2013 \u20b92800",
    "buy_url": "https://shop.m5stack.com/products/basic-core-iot-development-kit",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB/battery))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 12 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 26 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "wemos-d1-mini-esp8266",
    "name": "WeMos D1 Mini (ESP8266)",
    "manufacturer": "Espressif (module by Wemos)",
    "architecture": "32-bit Tensilica L106",
    "short_description": "The tiny, breadboard-friendly ESP8266 board that made cheap Wi-Fi mainstream.",
    "long_description": "The D1 Mini packages an ESP8266 into a tiny, breadboard-friendly footprint with USB-to-serial built in, and became one of the most widely cloned Wi-Fi dev boards for cheap IoT projects.",
    "clock_speed": "80 MHz (up to 160 MHz)",
    "flash_memory": "4 MB",
    "ram": "~80 KB usable",
    "operating_voltage": "3.3V (5V via USB)",
    "io_pins_count": 11,
    "adc_channels": "1 (10-bit)",
    "communication": "WiFi,I2C,SPI,UART",
    "package_type": "SMD module on board",
    "price_range": "\u20b9150 \u2013 \u20b9300",
    "buy_url": "https://www.espressif.com/en/products/socs/esp8266",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 11 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "heltec-wifi-kit-32",
    "name": "Heltec WiFi Kit 32 (ESP32)",
    "manufacturer": "Heltec / Espressif",
    "architecture": "32-bit dual-core Xtensa LX6",
    "short_description": "ESP32 dev board with a built-in OLED screen, handy for status readouts without extra wiring.",
    "long_description": "Heltec's WiFi Kit 32 bundles a base ESP32 module with a small onboard OLED display, saving the wiring normally needed to add a status screen to an ESP32 project.",
    "clock_speed": "Up to 240 MHz",
    "flash_memory": "4 MB",
    "ram": "520 KB SRAM",
    "operating_voltage": "3.3V (5V via USB)",
    "io_pins_count": 21,
    "adc_channels": "12 (12-bit)",
    "communication": "WiFi,BLE,I2C,SPI,UART",
    "package_type": "SMD module on board",
    "price_range": "\u20b9450 \u2013 \u20b9750",
    "buy_url": "https://heltec.org/project/wifi-kit-32/",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 12 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 21 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "nrf51822-microbit-v1",
    "name": "nRF51822 (BBC micro:bit v1)",
    "manufacturer": "Nordic Semiconductor",
    "architecture": "32-bit ARM Cortex-M0",
    "short_description": "The first BLE chip millions of UK schoolkids coded on, via the original micro:bit.",
    "long_description": "The nRF51822 combines a Cortex-M0 core with a Bluetooth Low Energy radio, and became widely known as the brain of the original BBC micro:bit, introducing a generation of students to embedded programming.",
    "clock_speed": "16 MHz",
    "flash_memory": "256 KB",
    "ram": "16 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.6V",
    "io_pins_count": 31,
    "adc_channels": "8 (10-bit)",
    "communication": "BLE,I2C,SPI,UART",
    "package_type": "QFN-48",
    "price_range": "\u20b9300 \u2013 \u20b9500",
    "buy_url": "https://www.nordicsemi.com/Products/nRF51822",
    "datasheet_url": "https://infocenter.nordicsemi.com/pdf/nRF51822_PS_v3.1.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 31 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "nrf52832",
    "name": "nRF52832",
    "manufacturer": "Nordic Semiconductor",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "A go-to BLE 5 chip for wearables, balancing performance, power draw and price.",
    "long_description": "The nRF52832 pairs a Cortex-M4F core with a BLE 5-capable radio and Nordic's SoftDevice stack, making it one of the most widely used chips for fitness trackers and other BLE wearables.",
    "clock_speed": "64 MHz",
    "flash_memory": "512 KB",
    "ram": "64 KB SRAM",
    "operating_voltage": "1.7V \u2013 3.6V",
    "io_pins_count": 32,
    "adc_channels": "8 (12-bit)",
    "communication": "BLE,ANT,I2C,SPI,UART",
    "package_type": "QFN-48 / WLCSP",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.nordicsemi.com/Products/nRF52832",
    "datasheet_url": "https://infocenter.nordicsemi.com/pdf/nRF52832_PS_v1.8.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 32 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "nrf52840",
    "name": "nRF52840",
    "manufacturer": "Nordic Semiconductor",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Nordic's flagship wireless MCU: BLE, Thread, Zigbee and USB on one chip.",
    "long_description": "The nRF52840 is Nordic's high-end wireless MCU, adding USB, more memory and multiprotocol radio support (BLE, Thread, Zigbee, 802.15.4) on top of the nRF52832 \u2014 used on boards like the Adafruit Feather nRF52840 and Particle Xenon.",
    "clock_speed": "64 MHz",
    "flash_memory": "1 MB",
    "ram": "256 KB SRAM",
    "operating_voltage": "1.7V \u2013 3.6V",
    "io_pins_count": 48,
    "adc_channels": "8 (12-bit)",
    "communication": "BLE,Thread,Zigbee,USB,I2C,SPI,UART",
    "package_type": "QFN-73 / WLCSP",
    "price_range": "\u20b9500 \u2013 \u20b9850",
    "buy_url": "https://www.nordicsemi.com/Products/nRF52840",
    "datasheet_url": "https://infocenter.nordicsemi.com/pdf/nRF52840_PS_v1.11.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 48 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "nrf5340",
    "name": "nRF5340",
    "manufacturer": "Nordic Semiconductor",
    "architecture": "32-bit dual-core ARM Cortex-M33",
    "short_description": "Dual Cortex-M33 wireless SoC, splitting application and radio duties across two cores.",
    "long_description": "The nRF5340 splits work across two Cortex-M33 cores \u2014 one for the application, one dedicated to the radio protocol stack \u2014 giving cleaner separation and TrustZone security for demanding BLE/Thread products.",
    "clock_speed": "Up to 128 MHz (app) / 64 MHz (network)",
    "flash_memory": "1 MB (app) + 256 KB (network)",
    "ram": "512 KB (app) + 64 KB (network)",
    "operating_voltage": "1.7V \u2013 3.6V",
    "io_pins_count": 42,
    "adc_channels": "8 (12-bit)",
    "communication": "BLE,Thread,Zigbee,USB,I2C,SPI,UART",
    "package_type": "WLCSP / AQFN-73",
    "price_range": "\u20b9700 \u2013 \u20b91100",
    "buy_url": "https://www.nordicsemi.com/Products/nRF5340",
    "datasheet_url": "https://infocenter.nordicsemi.com/pdf/nRF5340_PS_v1.4.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 42 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "nrf9160",
    "name": "nRF9160",
    "manufacturer": "Nordic Semiconductor",
    "architecture": "32-bit ARM Cortex-M33",
    "short_description": "Cellular IoT SiP combining an application core with an LTE-M/NB-IoT modem.",
    "long_description": "The nRF9160 is a system-in-package that pairs a Cortex-M33 application core with a full LTE-M/NB-IoT cellular modem and GPS, letting a single module connect directly to cellular networks without Wi-Fi or gateways.",
    "clock_speed": "64 MHz",
    "flash_memory": "1 MB",
    "ram": "256 KB SRAM",
    "operating_voltage": "1.7V \u2013 5.5V",
    "io_pins_count": 27,
    "adc_channels": "4 (12-bit)",
    "communication": "LTE-M,NB-IoT,GPS,I2C,SPI,UART",
    "package_type": "LGA-142 (SiP)",
    "price_range": "\u20b91400 \u2013 \u20b92200",
    "buy_url": "https://www.nordicsemi.com/Products/nRF9160",
    "datasheet_url": "https://infocenter.nordicsemi.com/pdf/nRF9160_PS_v2.3.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 4 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 27 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "nrf52833-microbit-v2",
    "name": "nRF52833 (BBC micro:bit v2)",
    "manufacturer": "Nordic Semiconductor",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "The upgraded BLE chip behind the second-generation micro:bit, with a mic and speaker.",
    "long_description": "The nRF52833 upgrades the original micro:bit's nRF51822 to a Cortex-M4F core with more memory, powering the BBC micro:bit v2 with its added microphone, speaker and touch logo.",
    "clock_speed": "64 MHz",
    "flash_memory": "512 KB",
    "ram": "128 KB SRAM",
    "operating_voltage": "1.7V \u2013 3.6V",
    "io_pins_count": 42,
    "adc_channels": "8 (12-bit)",
    "communication": "BLE,I2C,SPI,UART",
    "package_type": "QFN-73",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.nordicsemi.com/Products/nRF52833",
    "datasheet_url": "https://infocenter.nordicsemi.com/pdf/nRF52833_PS_v1.7.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 42 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "nrf52820",
    "name": "nRF52820",
    "manufacturer": "Nordic Semiconductor",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Cost-reduced nRF52 variant aimed at BLE accessories like dongles and mice.",
    "long_description": "The nRF52820 trims memory and pin count from the nRF52832 to hit a lower price point, commonly used in BLE dongles, remotes and other simple wireless accessories.",
    "clock_speed": "64 MHz",
    "flash_memory": "256 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "1.7V \u2013 5.5V",
    "io_pins_count": 15,
    "adc_channels": "6 (12-bit)",
    "communication": "BLE,USB,I2C,SPI,UART",
    "package_type": "QFN-40",
    "price_range": "\u20b9200 \u2013 \u20b9350",
    "buy_url": "https://www.nordicsemi.com/Products/nRF52820",
    "datasheet_url": "https://infocenter.nordicsemi.com/pdf/nRF52820_PS_v1.2.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 6 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 15 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "rp2350-pico2",
    "name": "RP2350 (Raspberry Pi Pico 2)",
    "manufacturer": "Raspberry Pi Foundation",
    "architecture": "32-bit (switchable dual Cortex-M33 or dual Hazard3 RISC-V)",
    "short_description": "Successor to the RP2040, with a unique switchable ARM/RISC-V core architecture.",
    "long_description": "The RP2350 doubles down on the original Pico's PIO idea while adding a striking feature: at boot, the chip can be configured to run either dual Cortex-M33 cores or dual open-source Hazard3 RISC-V cores.",
    "clock_speed": "Up to 150 MHz",
    "flash_memory": "4 MB external QSPI flash (typical board)",
    "ram": "520 KB SRAM",
    "operating_voltage": "1.8V \u2013 5.5V (via VSYS)",
    "io_pins_count": 30,
    "adc_channels": "4 (12-bit) + temp sensor",
    "communication": "I2C,SPI,UART,USB,PIO",
    "package_type": "QFN-60",
    "price_range": "\u20b9400 \u2013 \u20b9600",
    "buy_url": "https://www.raspberrypi.com/products/raspberry-pi-pico-2/",
    "datasheet_url": "https://datasheets.raspberrypi.com/rp2350/rp2350-datasheet.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 5.5V (via VSYS))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 4 (12-bit) + temp sensor analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 30 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "gd32vf103-longan-nano",
    "name": "GD32VF103CBT6 (Sipeed Longan Nano)",
    "manufacturer": "GigaDevice",
    "architecture": "32-bit RISC-V (Bumblebee core)",
    "short_description": "One of the first widely available RISC-V dev boards, pin-compatible with STM32F103.",
    "long_description": "The GD32VF103 uses a RISC-V core instead of ARM, while keeping register-level compatibility with the STM32F103 family \u2014 the Sipeed Longan Nano board built around it was one of the earliest accessible RISC-V dev boards.",
    "clock_speed": "Up to 108 MHz",
    "flash_memory": "128 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "2.6V \u2013 3.6V",
    "io_pins_count": 37,
    "adc_channels": "10 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-48 (module on board)",
    "price_range": "\u20b9300 \u2013 \u20b9500",
    "buy_url": "https://www.gigadevice.com/microcontroller/gd32vf103cbt6/",
    "datasheet_url": "https://www.gigadevice.com/datasheet/gd32vf103xxxx-datasheet/"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.6V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 37 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "ch32v003",
    "name": "CH32V003",
    "manufacturer": "WCH (Nanjing Qinheng)",
    "architecture": "32-bit RISC-V (QingKe V2A)",
    "short_description": "An astonishingly cheap RISC-V chip, undercutting even the smallest 8-bit AVRs on price.",
    "long_description": "The CH32V003 made headlines for offering a real 32-bit RISC-V core at a price rivaling the cheapest 8-bit chips, letting hobbyists use modern tooling on extremely cost-sensitive designs.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "16 KB",
    "ram": "2 KB SRAM",
    "operating_voltage": "2.7V \u2013 5.5V",
    "io_pins_count": 18,
    "adc_channels": "8 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "SOP-8 / TSSOP-20 / QFN-20",
    "price_range": "\u20b915 \u2013 \u20b940",
    "buy_url": "https://www.wch-ic.com/products/CH32V003.html",
    "datasheet_url": "https://www.wch-ic.com/downloads/CH32V003DS0_PDF.html"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.7V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 18 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "k210-kendryte",
    "name": "Kendryte K210",
    "manufacturer": "Canaan (Kendryte)",
    "architecture": "32-bit dual-core RISC-V (RV64GC)",
    "short_description": "RISC-V chip with a built-in neural-network accelerator for on-device AI vision.",
    "long_description": "The K210 pairs two 64-bit RISC-V cores with a dedicated KPU neural-network accelerator, aimed at low-cost on-device computer vision and audio recognition without needing a cloud connection.",
    "clock_speed": "Up to 400 MHz",
    "flash_memory": "16 MB (typical board, external flash)",
    "ram": "8 MB SRAM",
    "operating_voltage": "3.3V (5V via USB)",
    "io_pins_count": 48,
    "adc_channels": "N/A (uses camera/audio ADC peripherals)",
    "communication": "I2C,SPI,UART,I2S",
    "package_type": "BGA-179 (module on board)",
    "price_range": "\u20b9900 \u2013 \u20b91400",
    "buy_url": "https://canaan.io/product/kendryteai",
    "datasheet_url": "https://s3.cn-north-1.amazonaws.com.cn/dl.kendryte.com/documents/kendryte_datasheet_20191114144058_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 48 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "rx65n-envision",
    "name": "RX65N (Envision Kit)",
    "manufacturer": "Renesas Electronics",
    "architecture": "32-bit RXv2",
    "short_description": "A 32-bit chip built around Renesas's own RX instruction set rather than ARM.",
    "long_description": "The RX65N uses Renesas's proprietary RXv2 core instead of a licensed ARM core, aimed at industrial control applications, and is commonly seen on Renesas's low-cost Envision development kits.",
    "clock_speed": "Up to 120 MHz",
    "flash_memory": "2 MB",
    "ram": "640 KB SRAM",
    "operating_voltage": "2.7V \u2013 3.6V",
    "io_pins_count": 111,
    "adc_channels": "21 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,Ethernet",
    "package_type": "LQFP-144",
    "price_range": "\u20b9500 \u2013 \u20b9850",
    "buy_url": "https://www.renesas.com/en/products/microcontrollers-microprocessors/rx-32-bit-performance-efficiency-mcus/rx65n-rx651-32-bit-microcontrollers-usb-ethernet-security-and-graphics",
    "datasheet_url": "https://www.renesas.com/en/document/dst/rx65n-group-rx651-group-datasheet"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 21 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 111 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "ra4m1-uno-r4",
    "name": "RA4M1 (Arduino Uno R4)",
    "manufacturer": "Renesas Electronics",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Renesas chip that replaced the AVR core in the newest official Arduino Uno.",
    "long_description": "The RA4M1 marks Arduino's move away from AVR for its flagship Uno board, giving the Uno R4 a real Cortex-M4F core, more memory, and a built-in LED matrix driver, while keeping the classic Uno form factor.",
    "clock_speed": "48 MHz",
    "flash_memory": "256 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "1.6V \u2013 5.5V (board: 5V logic)",
    "io_pins_count": 30,
    "adc_channels": "14 (14-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-64 (module on board)",
    "price_range": "\u20b9700 \u2013 \u20b91100",
    "buy_url": "https://www.renesas.com/en/products/microcontrollers-microprocessors/ra-cortex-m-mcus/ra4m1-32-bit-arm-cortex-m4-general-purpose-microcontroller",
    "datasheet_url": "https://www.renesas.com/en/document/dst/ra4m1-group-datasheet"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.6V \u2013 5.5V (board: 5V logic))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 14 (14-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 30 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "rl78g13",
    "name": "RL78/G13",
    "manufacturer": "Renesas Electronics",
    "architecture": "16-bit RL78",
    "short_description": "Ultra-low-power 16-bit chip common in Japanese industrial and appliance designs.",
    "long_description": "The RL78/G13 is a 16-bit low-power MCU widely used in industrial equipment and appliances, especially popular in Japanese-designed products, balancing decent peripherals with strong power efficiency.",
    "clock_speed": "Up to 32 MHz",
    "flash_memory": "128 KB",
    "ram": "12 KB SRAM",
    "operating_voltage": "1.6V \u2013 5.5V",
    "io_pins_count": 66,
    "adc_channels": "18 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "LQFP-80",
    "price_range": "\u20b9200 \u2013 \u20b9350",
    "buy_url": "https://www.renesas.com/en/products/microcontrollers-microprocessors/rl78-low-power-8-16-bit-mcus/rl78g13-general-purpose-microcontrollers",
    "datasheet_url": "https://www.renesas.com/en/document/dst/rl78g13-datasheet"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.6V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 66 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "r8c38a",
    "name": "R8C/38A",
    "manufacturer": "Renesas Electronics",
    "architecture": "16-bit R8C",
    "short_description": "Simple, inexpensive 16-bit chip found in cost-sensitive Japanese consumer electronics.",
    "long_description": "The R8C/38A offers a straightforward 16-bit core at low cost, and has been widely used in cost-sensitive consumer electronics and small appliances where a full 32-bit chip would be overkill.",
    "clock_speed": "Up to 20 MHz",
    "flash_memory": "32 KB",
    "ram": "2 KB SRAM",
    "operating_voltage": "2.7V \u2013 5.5V",
    "io_pins_count": 46,
    "adc_channels": "10 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "LQFP-52",
    "price_range": "\u20b9150 \u2013 \u20b9280",
    "buy_url": "https://www.renesas.com/en/products/microcontrollers-microprocessors/r8c-8-16-bit-mcus",
    "datasheet_url": "https://www.renesas.com/en/document/dst/r8c38a-group-datasheet"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.7V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 46 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "xmc1100-boot-kit",
    "name": "XMC1100 (Boot Kit)",
    "manufacturer": "Infineon Technologies",
    "architecture": "32-bit ARM Cortex-M0",
    "short_description": "Infineon's entry-level Cortex-M0 line, low-cost and easy to prototype with.",
    "long_description": "The XMC1100 is Infineon's low-cost entry point into its XMC industrial microcontroller family, offering a simple Cortex-M0 core aimed at general-purpose control and sensor interfacing.",
    "clock_speed": "Up to 32 MHz",
    "flash_memory": "64 KB",
    "ram": "16 KB SRAM",
    "operating_voltage": "2.85V \u2013 5.5V",
    "io_pins_count": 27,
    "adc_channels": "8 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "TSSOP-38",
    "price_range": "\u20b9150 \u2013 \u20b9280",
    "buy_url": "https://www.infineon.com/cms/en/product/microcontroller/32-bit-industrial-microcontroller-based-on-arm-cortex-m/32-bit-xmc1000-industrial-microcontroller-arm-cortex-m0/xmc1100/",
    "datasheet_url": "https://www.infineon.com/dgdl/Infineon-XMC1100-DS-v01_04-EN.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.85V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 27 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "xmc4500-relax-kit",
    "name": "XMC4500 (Relax Kit)",
    "manufacturer": "Infineon Technologies",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Industrial-grade Cortex-M4 aimed at motor control and digital power applications.",
    "long_description": "The XMC4500 targets industrial motor control and digital power conversion with a Cortex-M4F core plus dedicated peripherals like the CORDIC-accelerated math coprocessor Infineon includes on the XMC4000 line.",
    "clock_speed": "Up to 120 MHz",
    "flash_memory": "1 MB",
    "ram": "160 KB SRAM",
    "operating_voltage": "3.13V \u2013 3.63V",
    "io_pins_count": 111,
    "adc_channels": "24 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,Ethernet",
    "package_type": "LQFP-144",
    "price_range": "\u20b9500 \u2013 \u20b9850",
    "buy_url": "https://www.infineon.com/cms/en/product/microcontroller/32-bit-industrial-microcontroller-based-on-arm-cortex-m/32-bit-xmc4000-industrial-microcontroller-arm-cortex-m4/xmc4500/",
    "datasheet_url": "https://www.infineon.com/dgdl/Infineon-XMC4500-DS-v01_08-EN.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.13V \u2013 3.63V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 24 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 111 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "psoc4-cy8c4245",
    "name": "PSoC 4 (CY8C4245AXI)",
    "manufacturer": "Infineon (Cypress)",
    "architecture": "32-bit ARM Cortex-M0",
    "short_description": "Cortex-M0 chip with reconfigurable analog and digital blocks defined in software.",
    "long_description": "PSoC 4 pairs a Cortex-M0 core with Cypress's signature programmable analog/digital blocks, letting designers implement custom analog front-ends and logic in software rather than fixed silicon.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "32 KB",
    "ram": "4 KB SRAM",
    "operating_voltage": "1.71V \u2013 5.5V",
    "io_pins_count": 36,
    "adc_channels": "8 (12-bit SAR)",
    "communication": "I2C,SPI,UART",
    "package_type": "QFN-40 / TQFP-44",
    "price_range": "\u20b9150 \u2013 \u20b9280",
    "buy_url": "https://www.infineon.com/cms/en/product/microcontroller/32-bit-psoc-arm-cortex-microcontroller/psoc-4-32-bit-arm-cortex-m0-mcu/",
    "datasheet_url": "https://www.infineon.com/dgdl/Infineon-PSoC_4200-DataSheet-v09_00-EN.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.71V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit SAR) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 36 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "psoc6-cy8c624abzi",
    "name": "PSoC 6 (CY8C624ABZI-D44)",
    "manufacturer": "Infineon (Cypress)",
    "architecture": "32-bit dual-core ARM Cortex-M4 + Cortex-M0+",
    "short_description": "Dual-core PSoC chip pairing a performance M4 with an ultra-low-power M0+, plus BLE.",
    "long_description": "PSoC 6 splits work between a Cortex-M4F for heavier tasks and a Cortex-M0+ for background/low-power tasks, and includes BLE plus the programmable analog/digital fabric PSoC is known for.",
    "clock_speed": "Up to 150 MHz",
    "flash_memory": "1 MB",
    "ram": "288 KB SRAM",
    "operating_voltage": "1.7V \u2013 3.6V",
    "io_pins_count": 104,
    "adc_channels": "12 (12-bit SAR)",
    "communication": "BLE,I2C,SPI,UART,USB",
    "package_type": "BGA-116 / QFN-104",
    "price_range": "\u20b9450 \u2013 \u20b9750",
    "buy_url": "https://www.infineon.com/cms/en/product/microcontroller/32-bit-psoc-arm-cortex-microcontroller/psoc-6-32-bit-arm-cortex-m4-mcu/",
    "datasheet_url": "https://www.infineon.com/dgdl/Infineon-PSoC_6_MCU_CY8C62x8_CY8C62xA-DataSheet-v13_00-EN.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 12 (12-bit SAR) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 104 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "psoc5lp-cy8c58lp",
    "name": "PSoC 5LP (CY8C58LP)",
    "manufacturer": "Infineon (Cypress)",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "The original \"programmable system on chip\" line, with a full configurable analog subsystem.",
    "long_description": "PSoC 5LP is the mature, Cortex-M3-based generation of Cypress's programmable system-on-chip concept, offering an unusually deep configurable analog subsystem (op-amps, ADCs, DACs, filters) alongside standard digital logic.",
    "clock_speed": "Up to 80 MHz",
    "flash_memory": "256 KB",
    "ram": "64 KB SRAM",
    "operating_voltage": "1.71V \u2013 5.5V",
    "io_pins_count": 72,
    "adc_channels": "20 (20-bit Delta-Sigma)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "TQFP-100",
    "price_range": "\u20b9400 \u2013 \u20b9700",
    "buy_url": "https://www.infineon.com/cms/en/product/microcontroller/32-bit-psoc-arm-cortex-microcontroller/psoc-5lp-32-bit-arm-cortex-m3-mcu/",
    "datasheet_url": "https://www.infineon.com/dgdl/Infineon-PSoC_5LP_CY8C58LP-DataSheet-v13_00-EN.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.71V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 72 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "efm32gg11-giant-gecko",
    "name": "EFM32GG11 (Giant Gecko)",
    "manufacturer": "Silicon Labs",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Large-memory, energy-friendly Cortex-M4 with an on-chip LCD controller.",
    "long_description": "The Giant Gecko line pairs Silicon Labs's \"Energy Friendly\" low-power design philosophy with a larger memory footprint than smaller Gecko parts, plus an integrated LCD controller for instrumentation displays.",
    "clock_speed": "Up to 72 MHz",
    "flash_memory": "2 MB",
    "ram": "512 KB SRAM",
    "operating_voltage": "1.85V \u2013 3.8V",
    "io_pins_count": 118,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,Ethernet",
    "package_type": "BGA-120 / QFP-100",
    "price_range": "\u20b9500 \u2013 \u20b9850",
    "buy_url": "https://www.silabs.com/mcu/32-bit-microcontrollers/efm32-giant-gecko-gg11",
    "datasheet_url": "https://www.silabs.com/documents/public/data-sheets/efm32gg11-datasheet.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.85V \u2013 3.8V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 118 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "efr32bg22-blue-gecko",
    "name": "EFR32BG22 (Blue Gecko)",
    "manufacturer": "Silicon Labs",
    "architecture": "32-bit ARM Cortex-M33",
    "short_description": "Compact BLE SoC built around Silicon Labs's energy-efficient Gecko platform.",
    "long_description": "The EFR32BG22 combines a Cortex-M33 core with BLE 5.2 radio, tuned for coin-cell-powered wireless sensors that need Silicon Labs's characteristic low sleep-current performance.",
    "clock_speed": "Up to 76.8 MHz",
    "flash_memory": "512 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "1.71V \u2013 3.8V",
    "io_pins_count": 20,
    "adc_channels": "8 (12-bit)",
    "communication": "BLE,I2C,SPI,UART",
    "package_type": "QFN-32",
    "price_range": "\u20b9250 \u2013 \u20b9450",
    "buy_url": "https://www.silabs.com/wireless/bluetooth/efr32bg22-series-2-socs",
    "datasheet_url": "https://www.silabs.com/documents/public/data-sheets/efr32bg22-datasheet.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.71V \u2013 3.8V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 20 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "efm8bb1-busy-bee",
    "name": "EFM8BB1 (Busy Bee)",
    "manufacturer": "Silicon Labs",
    "architecture": "8-bit 8051",
    "short_description": "A modern take on the classic 8051 core, tuned for simple, low-power control tasks.",
    "long_description": "The EFM8BB1 keeps the classic 8051 instruction set alive in a modern, energy-efficient package, aimed at simple control and sensor tasks that don't need a 32-bit core.",
    "clock_speed": "Up to 25 MHz",
    "flash_memory": "8 KB",
    "ram": "512 Bytes SRAM (+256B XRAM)",
    "operating_voltage": "1.8V \u2013 5.25V",
    "io_pins_count": 25,
    "adc_channels": "12-channel (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "QFN-32 / QSOP-24",
    "price_range": "\u20b980 \u2013 \u20b9150",
    "buy_url": "https://www.silabs.com/mcu/8-bit-microcontrollers/efm8-busy-bee",
    "datasheet_url": "https://www.silabs.com/documents/public/data-sheets/EFM8BB1-Datasheet.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 5.25V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 25 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "efr32mg21-mighty-gecko",
    "name": "EFR32MG21 (Mighty Gecko)",
    "manufacturer": "Silicon Labs",
    "architecture": "32-bit ARM Cortex-M33",
    "short_description": "Multiprotocol mesh radio chip supporting Zigbee, Thread and BLE for smart-home hubs.",
    "long_description": "The Mighty Gecko series is built for mesh networking, supporting Zigbee, Thread and Bluetooth on a Cortex-M33 core \u2014 commonly found inside smart-home hubs and bridges that need to speak several mesh protocols.",
    "clock_speed": "Up to 80 MHz",
    "flash_memory": "1 MB",
    "ram": "96 KB SRAM",
    "operating_voltage": "1.71V \u2013 3.8V",
    "io_pins_count": 25,
    "adc_channels": "12 (12-bit)",
    "communication": "Zigbee,Thread,BLE,I2C,SPI,UART",
    "package_type": "QFN-48",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.silabs.com/wireless/zigbee/efr32mg21-series-2-socs",
    "datasheet_url": "https://www.silabs.com/documents/public/data-sheets/efr32mg21-datasheet.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.71V \u2013 3.8V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 12 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 25 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "propeller-p8x32a",
    "name": "Parallax Propeller P8X32A",
    "manufacturer": "Parallax Inc.",
    "architecture": "32-bit multi-core (8x Cog)",
    "short_description": "An unusual 8-core chip where each core runs independently with no shared interrupts.",
    "long_description": "The P8X32A takes a very different approach: eight independent 32-bit \"Cog\" cores share access to memory and I/O with no traditional interrupt system, letting each core run its own dedicated task in parallel.",
    "clock_speed": "80 MHz (external crystal x PLL)",
    "flash_memory": "32 KB ROM (+external EEPROM)",
    "ram": "32 KB shared RAM (2KB/cog)",
    "operating_voltage": "3.3V",
    "io_pins_count": 32,
    "adc_channels": "0 (external ADC needed)",
    "communication": "I2C,SPI,UART",
    "package_type": "DIP-40 / QFN-44 / LQFP-44",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.parallax.com/product/propeller-p8x32a/",
    "datasheet_url": "https://www.parallax.com/downloads/propeller-p8x32a-datasheet"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 32 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "propeller2-p2x8c4m64p",
    "name": "Parallax Propeller 2 (P2X8C4M64P)",
    "manufacturer": "Parallax Inc.",
    "architecture": "32-bit multi-core (8x Cog, RISC-style)",
    "short_description": "The modernized 8-core Propeller with faster cogs, hardware CORDIC and smart pins.",
    "long_description": "Propeller 2 keeps the original chip's 8-core philosophy but modernizes it with a faster pipeline, a hardware CORDIC solver, and \"Smart Pins\" that can independently implement protocols like UART or PWM in hardware.",
    "clock_speed": "Up to 320 MHz",
    "flash_memory": "512 KB",
    "ram": "512 KB shared RAM",
    "operating_voltage": "1.8V \u2013 3.3V",
    "io_pins_count": 64,
    "adc_channels": "Smart-pin based ADC on any pin",
    "communication": "I2C,SPI,UART",
    "package_type": "QFN-100 / TQFP-100",
    "price_range": "\u20b9900 \u2013 \u20b91400",
    "buy_url": "https://www.parallax.com/propeller-2/",
    "datasheet_url": "https://www.parallax.com/downloads/propeller-2-datasheet"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.3V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's Smart-pin based ADC on any pin analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 64 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "ez80f91",
    "name": "eZ80F91",
    "manufacturer": "Zilog",
    "architecture": "8-bit eZ80 (Z80 successor)",
    "short_description": "A modernized descendant of the classic Z80, still used in point-of-sale and industrial gear.",
    "long_description": "The eZ80F91 modernizes Zilog's classic Z80 architecture with a faster pipeline and more addressable memory, and still shows up in point-of-sale terminals and legacy industrial equipment that trace back to Z80-based designs.",
    "clock_speed": "Up to 50 MHz",
    "flash_memory": "128 KB",
    "ram": "8 KB SRAM",
    "operating_voltage": "3.0V \u2013 3.6V",
    "io_pins_count": 43,
    "adc_channels": "0 (none)",
    "communication": "I2C,SPI,UART,Ethernet",
    "package_type": "LQFP-100",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.zilog.com/index.php?option=com_product&task=power&businessLine=3&form_id=6&productId=eZ80F91",
    "datasheet_url": "https://www.zilog.com/docs/ez80acclaim/ps0153.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.0V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 43 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "padauk-pfs154",
    "name": "Padauk PFS154",
    "manufacturer": "Padauk Technology",
    "architecture": "8-bit PADAUK",
    "short_description": "One of the cheapest microcontrollers in existence, sold for pennies in huge volume.",
    "long_description": "Padauk's PFS154 is built for extreme cost sensitivity \u2014 often cited as among the cheapest general-purpose MCUs available \u2014 trading a minimal toolchain and instruction set for a rock-bottom unit price at high volume.",
    "clock_speed": "Up to 8 MHz (internal)",
    "flash_memory": "2 KB (1K words)",
    "ram": "128 Bytes SRAM",
    "operating_voltage": "2.5V \u2013 5.5V",
    "io_pins_count": 16,
    "adc_channels": "5 (12-bit)",
    "communication": "I2C (bit-banged),SPI (bit-banged)",
    "package_type": "SOP-16 / SSOP-20",
    "price_range": "\u20b915 \u2013 \u20b935",
    "buy_url": "https://www.padauk.com.tw/en/product/PFS154",
    "datasheet_url": "https://www.padauk.com.tw/upload/product_file/PFS154_DS_ENG.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.5V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "5",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "6",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "7",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 5 (12-bit) analog input channels."
    },
    {
      "pin_number": "8",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 16 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "9",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "holtek-ht66f002",
    "name": "Holtek HT66F002",
    "manufacturer": "Holtek Semiconductor",
    "architecture": "8-bit Holtek",
    "short_description": "Compact 8-bit chip common in Taiwanese consumer electronics and small appliances.",
    "long_description": "The HT66F002 is a small, low-pin-count 8-bit MCU commonly used inside inexpensive consumer electronics \u2014 toys, small appliances, and simple sensor gadgets \u2014 where a minimal feature set keeps cost down.",
    "clock_speed": "Up to 12 MHz",
    "flash_memory": "4 KB",
    "ram": "192 Bytes SRAM",
    "operating_voltage": "2.2V \u2013 5.5V",
    "io_pins_count": 14,
    "adc_channels": "6 (12-bit)",
    "communication": "SPI",
    "package_type": "SOP-16 / SSOP-20",
    "price_range": "\u20b940 \u2013 \u20b990",
    "buy_url": "https://www.holtek.com/productdetail/-/vg/5262766",
    "datasheet_url": "https://www.holtek.com/documents/10179/116711/HT66F002v130.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.2V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "5",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 6 (12-bit) analog input channels."
    },
    {
      "pin_number": "6",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 14 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "7",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "wch-ch552",
    "name": "WCH CH552",
    "manufacturer": "WCH (Nanjing Qinheng)",
    "architecture": "8-bit 8051 core (enhanced)",
    "short_description": "Cheap 8051-core chip with built-in USB, popular for tiny DIY USB gadgets.",
    "long_description": "The CH552 pairs an enhanced 8051 core with native USB 2.0 full-speed support at a very low price, making it a popular choice for DIY USB dongles, simple HID devices and programmer adapters.",
    "clock_speed": "Up to 24 MHz",
    "flash_memory": "16 KB (14KB usable)",
    "ram": "256 Bytes SRAM (+ 1KB XRAM)",
    "operating_voltage": "3.3V \u2013 5V",
    "io_pins_count": 20,
    "adc_channels": "10-bit ADC on select pins",
    "communication": "I2C (bit-banged),SPI,UART,USB",
    "package_type": "SOP-16 / SOP-28 / TSSOP-20",
    "price_range": "\u20b960 \u2013 \u20b9110",
    "buy_url": "https://www.wch-ic.com/products/CH552.html",
    "datasheet_url": "https://www.wch-ic.com/downloads/CH552DS1_PDF.html"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V \u2013 5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 20 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "stc89c52rc",
    "name": "STC89C52RC",
    "manufacturer": "STC Microelectronics",
    "architecture": "8-bit 8051",
    "short_description": "An extremely common, low-cost clone-lineage 8051 popular across hobbyist courses in Asia.",
    "long_description": "The STC89C52RC is a widely used low-cost 8051-compatible chip built by STC, common in Chinese electronics courses and hobby kits thanks to its rock-bottom price and simple in-circuit programming.",
    "clock_speed": "Up to 35 MHz (typical 12 MHz)",
    "flash_memory": "8 KB",
    "ram": "512 Bytes SRAM",
    "operating_voltage": "3.4V \u2013 5.5V",
    "io_pins_count": 32,
    "adc_channels": "0 (none)",
    "communication": "I2C (bit-banged),SPI (bit-banged),UART",
    "package_type": "DIP-40 / PLCC-44 / LQFP-44",
    "price_range": "\u20b940 \u2013 \u20b990",
    "buy_url": "http://www.stcmcudata.com/",
    "datasheet_url": "http://www.stcmcu.com/datasheet/STC89C52RC_STC89C58RD.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.4V \u2013 5.5V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 32 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "gd32f103cbt6",
    "name": "GD32F103CBT6",
    "manufacturer": "GigaDevice",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "A drop-in, faster-clocked clone of the STM32F103 for boards that outgrow ST's supply.",
    "long_description": "GigaDevice designed the GD32F103 to be register- and pin-compatible with ST's STM32F103, but running at a higher clock speed for the same price \u2014 a common substitute when STM32 stock runs short.",
    "clock_speed": "Up to 108 MHz",
    "flash_memory": "128 KB",
    "ram": "20 KB SRAM",
    "operating_voltage": "2V \u2013 3.6V",
    "io_pins_count": 37,
    "adc_channels": "10 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-48",
    "price_range": "\u20b9150 \u2013 \u20b9300",
    "buy_url": "https://www.gigadevice.com/microcontroller/gd32f103cbt6/",
    "datasheet_url": "https://www.gigadevice.com/datasheet/gd32f103xx-datasheet/"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 37 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "toshiba-tmpm370",
    "name": "Toshiba TMPM370",
    "manufacturer": "Toshiba Electronic Devices",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "Industrial-grade Cortex-M3 from Toshiba, common in motor control applications in Japan.",
    "long_description": "The TMPM370 pairs a Cortex-M3 core with motor-control-oriented timers and analog peripherals, frequently used in Japanese-designed industrial motor drives and appliance control boards.",
    "clock_speed": "Up to 40 MHz",
    "flash_memory": "256 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "2.7V \u2013 3.6V",
    "io_pins_count": 65,
    "adc_channels": "17 (12-bit)",
    "communication": "I2C,SPI,UART,CAN",
    "package_type": "LQFP-100",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://toshiba.semicon-storage.com/ap-en/semiconductor/product/microcontrollers.html",
    "datasheet_url": "https://toshiba.semicon-storage.com/info/docget.jsp?did=13435"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "10",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 17 (12-bit) analog input channels."
    },
    {
      "pin_number": "11",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 65 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "12",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "ambiq-apollo3-blue",
    "name": "Ambiq Apollo3 Blue",
    "manufacturer": "Ambiq Micro",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Sub-threshold voltage design gives this chip exceptionally low active-mode power draw.",
    "long_description": "Ambiq's Apollo3 Blue uses subthreshold power optimization techniques to hit unusually low active-mode current draw for a Cortex-M4F with BLE, aimed at wearables where every microamp affects battery life.",
    "clock_speed": "Up to 96 MHz",
    "flash_memory": "1 MB",
    "ram": "384 KB SRAM",
    "operating_voltage": "1.8V \u2013 3.63V",
    "io_pins_count": 40,
    "adc_channels": "16 (14-bit)",
    "communication": "BLE,I2C,SPI,UART,USB",
    "package_type": "BGA-104 / CSP-81",
    "price_range": "\u20b9500 \u2013 \u20b9900",
    "buy_url": "https://ambiq.com/apollo3-blue/",
    "datasheet_url": "https://contentportal.ambiq.com/documents/20123/50840/Apollo3-Blue-SoC-Datasheet.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.8V \u2013 3.63V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (14-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 40 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "maxim-max32660",
    "name": "Maxim MAX32660",
    "manufacturer": "Analog Devices (Maxim)",
    "architecture": "32-bit dual-core ARM Cortex-M4",
    "short_description": "One of the smallest dual-core Cortex-M4 packages available, aimed at wearables.",
    "long_description": "The MAX32660 packs a dual Cortex-M4F core setup into an unusually tiny wafer-level package, aimed at space-constrained wearable and medical products that still need real compute headroom.",
    "clock_speed": "Up to 96 MHz",
    "flash_memory": "256 KB",
    "ram": "96 KB SRAM",
    "operating_voltage": "1.7V \u2013 3.6V",
    "io_pins_count": 14,
    "adc_channels": "0 (external ADC typical)",
    "communication": "I2C,SPI,UART",
    "package_type": "WLP-16 / TQFN-24",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.analog.com/en/products/max32660.html",
    "datasheet_url": "https://www.analog.com/media/en/technical-documentation/data-sheets/max32660.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 14 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "maxim-max78000",
    "name": "Maxim MAX78000",
    "manufacturer": "Analog Devices (Maxim)",
    "architecture": "32-bit ARM Cortex-M4 + RISC-V co-processor",
    "short_description": "Ultra-low-power AI accelerator chip built for running small neural networks on a coin cell.",
    "long_description": "The MAX78000 pairs a Cortex-M4F with a dedicated convolutional neural network accelerator and a RISC-V co-processor, designed to run small vision/audio AI models directly on tiny embedded devices with minimal power.",
    "clock_speed": "Up to 100 MHz",
    "flash_memory": "512 KB",
    "ram": "128 KB SRAM",
    "operating_voltage": "1.7V \u2013 3.6V",
    "io_pins_count": 40,
    "adc_channels": "8 (10-bit)",
    "communication": "I2C,SPI,UART,I2S",
    "package_type": "TQFN-56 / WLP-81",
    "price_range": "\u20b91200 \u2013 \u20b91900",
    "buy_url": "https://www.analog.com/en/products/max78000.html",
    "datasheet_url": "https://www.analog.com/media/en/technical-documentation/data-sheets/max78000.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (1.7V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 40 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "cypress-fx2lp-cy7c68013a",
    "name": "Cypress FX2LP (CY7C68013A)",
    "manufacturer": "Infineon (Cypress)",
    "architecture": "8-bit enhanced 8051 core",
    "short_description": "A USB 2.0 bridge chip with an onboard 8051, once ubiquitous in USB peripherals and SDR dongles.",
    "long_description": "The FX2LP pairs an enhanced 8051 core with a USB 2.0 high-speed transceiver and a general programmable interface, and became a go-to chip for USB peripheral bridges \u2014 including many early software-defined radio dongles.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "Uses external/host firmware load (no internal flash)",
    "ram": "16 KB SRAM",
    "operating_voltage": "3.3V (5V tolerant I/O)",
    "io_pins_count": 40,
    "adc_channels": "0 (none)",
    "communication": "I2C,SPI (bit-banged),USB",
    "package_type": "LQFP-100 / TQFP-128",
    "price_range": "\u20b9300 \u2013 \u20b9550",
    "buy_url": "https://www.infineon.com/cms/en/product/universal-serial-bus/usb-2.0-peripheral-controllers/ez-usb-fx2lp-fx2g2-usb-2.0-peripheral-controller/cy7c68013a/",
    "datasheet_url": "https://www.infineon.com/dgdl/Infineon-CY7C68013A_CY7C68014A_CY7C68015A_CY7C68016A_EZ-USB_FX2LP_USB_Microcontroller_High_Speed_USB_Peripheral_Controller-DataSheet-v08_00-EN.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V tolerant I/O))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 40 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "adafruit-feather-nrf52840",
    "name": "Adafruit Feather nRF52840 Express",
    "manufacturer": "Adafruit (Nordic nRF52840)",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "Adafruit's Feather-format board built around the nRF52840, with native USB and BLE.",
    "long_description": "This Feather board wraps the nRF52840 in Adafruit's standard Feather footprint, giving makers BLE 5, native USB and CircuitPython support in a familiar breadboard-friendly shape.",
    "clock_speed": "64 MHz",
    "flash_memory": "1 MB",
    "ram": "256 KB SRAM",
    "operating_voltage": "3.3V (5V via USB)",
    "io_pins_count": 22,
    "adc_channels": "6 (12-bit)",
    "communication": "BLE,USB,I2C,SPI,UART",
    "package_type": "Module on board",
    "price_range": "\u20b91400 \u2013 \u20b92000",
    "buy_url": "https://www.adafruit.com/product/4062",
    "datasheet_url": "https://infocenter.nordicsemi.com/pdf/nRF52840_PS_v1.11.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 6 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 22 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "particle-photon-stm32f205",
    "name": "Particle Photon (STM32F205 + BCM43362)",
    "manufacturer": "Particle (STMicroelectronics)",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "Cloud-connected Wi-Fi dev board pairing an STM32 with a dedicated Wi-Fi companion chip.",
    "long_description": "The Particle Photon pairs an STM32F205 application processor with a separate Broadcom Wi-Fi chip and Particle's cloud device-management platform, aimed at makers who want managed, fleet-friendly IoT devices.",
    "clock_speed": "120 MHz",
    "flash_memory": "1 MB",
    "ram": "128 KB SRAM",
    "operating_voltage": "3.3V (5V via USB)",
    "io_pins_count": 18,
    "adc_channels": "8 (12-bit)",
    "communication": "WiFi,I2C,SPI,UART",
    "package_type": "Module on board",
    "price_range": "\u20b91200 \u2013 \u20b91800",
    "buy_url": "https://www.particle.io/photon/",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f205rc.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 8 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 18 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "particle-argon-nrf52840-esp32",
    "name": "Particle Argon (nRF52840 + ESP32)",
    "manufacturer": "Particle (Nordic + Espressif)",
    "architecture": "32-bit ARM Cortex-M4 (+ Xtensa co-processor)",
    "short_description": "Combines a BLE/mesh main chip with an ESP32 acting purely as a Wi-Fi network co-processor.",
    "long_description": "The Argon uses the nRF52840 as its main application processor for BLE and Particle Mesh, while an onboard ESP32 acts solely as a Wi-Fi network co-processor, splitting radio duties across two chips.",
    "clock_speed": "64 MHz",
    "flash_memory": "1 MB",
    "ram": "256 KB SRAM",
    "operating_voltage": "3.3V (5V via USB)",
    "io_pins_count": 20,
    "adc_channels": "6 (12-bit)",
    "communication": "BLE,WiFi,I2C,SPI,UART",
    "package_type": "Module on board",
    "price_range": "\u20b91600 \u2013 \u20b92200",
    "buy_url": "https://www.particle.io/argon/",
    "datasheet_url": "https://infocenter.nordicsemi.com/pdf/nRF52840_PS_v1.11.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 6 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 20 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "maple-mini-stm32f103",
    "name": "Maple Mini (STM32F103CBT6)",
    "manufacturer": "LeafLabs (STMicroelectronics)",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "One of the earliest Arduino-compatible ARM boards, predating today's STM32 dev-board wave.",
    "long_description": "The Maple Mini was among the first widely available Arduino-compatible boards built on a real ARM core, introducing many hobbyists to 32-bit development years before the current wave of cheap STM32 boards.",
    "clock_speed": "72 MHz",
    "flash_memory": "128 KB",
    "ram": "20 KB SRAM",
    "operating_voltage": "3.3V (5V tolerant I/O)",
    "io_pins_count": 34,
    "adc_channels": "9 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-48",
    "price_range": "\u20b9350 \u2013 \u20b9600",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f103cb.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f103cb.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V tolerant I/O))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 9 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 34 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "pyboard-stm32f405",
    "name": "Pyboard v1.1 (STM32F405RG)",
    "manufacturer": "MicroPython / STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "The original MicroPython reference board, built to run Python directly on bare metal.",
    "long_description": "The Pyboard was designed as the original reference hardware for MicroPython, built around an STM32F405 to prove that a modern scripting language could run directly and responsively on a microcontroller.",
    "clock_speed": "168 MHz",
    "flash_memory": "1 MB",
    "ram": "192 KB SRAM",
    "operating_voltage": "3.3V (5V via USB)",
    "io_pins_count": 46,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-64",
    "price_range": "\u20b91200 \u2013 \u20b91800",
    "buy_url": "https://micropython.org/",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f405rg.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 16 (12-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 46 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "m5stickc-esp32-pico",
    "name": "M5StickC (ESP32-PICO-D4)",
    "manufacturer": "M5Stack / Espressif",
    "architecture": "32-bit dual-core Xtensa LX6",
    "short_description": "A keychain-sized ESP32 dev kit with a screen, IMU, IR and battery all built in.",
    "long_description": "The ESP32-PICO-D4 integrates the ESP32 chip and its flash into one small package, which M5Stack uses to build the pocket-sized M5StickC \u2014 complete with a small screen, IMU, IR blaster and battery in a keychain form factor.",
    "clock_speed": "Up to 240 MHz",
    "flash_memory": "4 MB (embedded)",
    "ram": "520 KB SRAM",
    "operating_voltage": "3.3V (5V via USB/battery)",
    "io_pins_count": 10,
    "adc_channels": "6 (12-bit)",
    "communication": "WiFi,BLE,I2C,SPI,UART",
    "package_type": "LGA-48 (module in cased unit)",
    "price_range": "\u20b91000 \u2013 \u20b91600",
    "buy_url": "https://shop.m5stack.com/products/stick-c",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32-pico-d4_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB/battery))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 6 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 10 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "lolin32-esp32",
    "name": "LOLIN32 (ESP32)",
    "manufacturer": "Wemos/LOLIN (Espressif)",
    "architecture": "32-bit dual-core Xtensa LX6",
    "short_description": "A compact, low-cost ESP32 board with an onboard battery charge circuit.",
    "long_description": "LOLIN32 packages a base ESP32 into a small, inexpensive board with a built-in LiPo charging circuit, popular for battery-powered IoT projects that don't need extra shields.",
    "clock_speed": "Up to 240 MHz",
    "flash_memory": "4 MB",
    "ram": "520 KB SRAM",
    "operating_voltage": "3.3V (5V via USB/battery)",
    "io_pins_count": 25,
    "adc_channels": "18 (12-bit)",
    "communication": "WiFi,BLE,I2C,SPI,UART",
    "package_type": "SMD module on board",
    "price_range": "\u20b9350 \u2013 \u20b9550",
    "buy_url": "https://www.wemos.cc/en/latest/d32/d32.html",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB/battery))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 18 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 25 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "nodemcu-v3-esp8266",
    "name": "NodeMCU v3 (ESP8266)",
    "manufacturer": "Espressif (module)",
    "architecture": "32-bit Tensilica L106",
    "short_description": "The dev board that popularized Lua/Arduino-style scripting on the ESP8266.",
    "long_description": "NodeMCU pairs an ESP8266 module with USB-to-serial and a breadboard-friendly layout, and the accompanying open-source Lua firmware helped popularize easy scripting on cheap Wi-Fi chips.",
    "clock_speed": "80 MHz (up to 160 MHz)",
    "flash_memory": "4 MB",
    "ram": "~80 KB usable",
    "operating_voltage": "3.3V (5V via USB)",
    "io_pins_count": 17,
    "adc_channels": "1 (10-bit)",
    "communication": "WiFi,I2C,SPI,UART",
    "package_type": "SMD module on board",
    "price_range": "\u20b9180 \u2013 \u20b9350",
    "buy_url": "https://www.espressif.com/en/products/socs/esp8266",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 17 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "10",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "sparkfun-thing-plus-samd51",
    "name": "SparkFun Thing Plus (SAMD51)",
    "manufacturer": "SparkFun (Microchip)",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "A Feather-footprint board built around the faster SAMD51 for heavier CircuitPython projects.",
    "long_description": "SparkFun's Thing Plus puts the SAMD51 in a Feather-compatible footprint, giving CircuitPython and Arduino users a faster, more capable alternative to SAMD21-based boards for graphics- or DSP-heavy projects.",
    "clock_speed": "Up to 120 MHz",
    "flash_memory": "512 KB",
    "ram": "192 KB SRAM",
    "operating_voltage": "3.3V (5V via USB)",
    "io_pins_count": 24,
    "adc_channels": "12 (12-bit)",
    "communication": "I2C,SPI,UART,USB,I2S",
    "package_type": "Module on board",
    "price_range": "\u20b91200 \u2013 \u20b91800",
    "buy_url": "https://www.sparkfun.com/products/14713",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/60001507C.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 12 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 24 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "blackpill-stm32f103",
    "name": "STM32F103C6T6 (early Blue Pill variant)",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "A lower-flash sibling of the common Blue Pill chip, still found on some budget boards.",
    "long_description": "Some Blue-Pill-style boards ship with the smaller-flash F103C6 instead of the more common F103C8, offering the same Cortex-M3 core and pinout with less onboard flash for slightly less money.",
    "clock_speed": "Up to 72 MHz",
    "flash_memory": "32 KB",
    "ram": "10 KB SRAM",
    "operating_voltage": "2V \u2013 3.6V",
    "io_pins_count": 37,
    "adc_channels": "10 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-48",
    "price_range": "\u20b9180 \u2013 \u20b9350",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f103c6.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f103c6.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 37 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "teensy32-mk20dx256",
    "name": "Teensy 3.2 (MK20DX256)",
    "manufacturer": "PJRC (NXP Kinetis)",
    "architecture": "32-bit ARM Cortex-M4",
    "short_description": "A long-lived, tiny high-performance board that predates the Teensy 4 series.",
    "long_description": "Teensy 3.2 packs a Kinetis Cortex-M4F chip into an extremely small breadboard-friendly board, and remained a favorite for audio and precise-timing projects for years thanks to PJRC's excellent Audio and USB libraries.",
    "clock_speed": "72 MHz (overclockable to 96 MHz)",
    "flash_memory": "256 KB",
    "ram": "64 KB SRAM",
    "operating_voltage": "3.3V (5V tolerant on most pins)",
    "io_pins_count": 34,
    "adc_channels": "21 (13-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,I2S",
    "package_type": "QFN-64 (module on board)",
    "price_range": "\u20b91200 \u2013 \u20b91800",
    "buy_url": "https://www.pjrc.com/store/teensy32.html",
    "datasheet_url": "https://www.nxp.com/docs/en/data-sheet/K20P64M72SF1.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V tolerant on most pins))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 21 (13-bit) analog input channels."
    },
    {
      "pin_number": "13",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 34 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "14",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "bluepill-stm32f103c8t6-clone",
    "name": "STM32F103C8T6 Clone (CS32F103)",
    "manufacturer": "CKS / STMicroelectronics-compatible",
    "architecture": "32-bit ARM Cortex-M3",
    "short_description": "A common register-compatible clone chip found on many bargain \"Blue Pill\" boards.",
    "long_description": "Many budget Blue Pill boards ship with a register-compatible clone chip rather than genuine ST silicon; it targets the same STM32F103C8 register map and peripherals at a lower cost, though with less guaranteed quality control.",
    "clock_speed": "Up to 72 MHz",
    "flash_memory": "64 KB",
    "ram": "20 KB SRAM",
    "operating_voltage": "2V \u2013 3.6V (5V tolerant on most pins)",
    "io_pins_count": 37,
    "adc_channels": "10 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-48",
    "price_range": "\u20b9120 \u2013 \u20b9250",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32f103c8.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f103c8.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2V \u2013 3.6V (5V tolerant on most pins))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 37 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "digispark-attiny85",
    "name": "Digispark (ATtiny85)",
    "manufacturer": "Digistump (Microchip)",
    "architecture": "8-bit AVR",
    "short_description": "A USB-stick-sized ATtiny85 board with a software USB bootloader baked in.",
    "long_description": "Digispark shrinks an ATtiny85 down to a USB-thumb-drive-sized board with a V-USB software bootloader, letting it plug straight into a USB port for tiny, single-purpose gadgets without extra programming hardware.",
    "clock_speed": "16.5 MHz (via internal PLL)",
    "flash_memory": "8 KB (6KB usable w/ bootloader)",
    "ram": "512 Bytes SRAM",
    "operating_voltage": "5V (via USB)",
    "io_pins_count": 6,
    "adc_channels": "3 (10-bit)",
    "communication": "I2C (USI),SPI (USI),USB (software)",
    "package_type": "Module on board",
    "price_range": "\u20b9150 \u2013 \u20b9280",
    "buy_url": "https://digistump.com/products/1",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-2586-AVR-8-bit-Microcontroller-ATtiny25-ATtiny45-ATtiny85_Datasheet.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (5V (via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "5",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "6",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "7",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 6 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "8",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "trinket-m0-samd21",
    "name": "Adafruit Trinket M0 (SAMD21E18)",
    "manufacturer": "Adafruit (Microchip)",
    "architecture": "32-bit ARM Cortex-M0+",
    "short_description": "A tiny CircuitPython-friendly board that fits in the smallest project enclosures.",
    "long_description": "Trinket M0 packs a SAMD21 chip into one of the smallest CircuitPython-capable boards Adafruit makes, aimed at wearable and low-profile projects where every millimeter of board space matters.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "256 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "3.3V (5V via USB)",
    "io_pins_count": 5,
    "adc_channels": "3 (12-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "Module on board",
    "price_range": "\u20b9350 \u2013 \u20b9550",
    "buy_url": "https://www.adafruit.com/product/3500",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/SAM_D21_DA1_Family_DataSheet_DS40001882F.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 3 (12-bit) analog input channels."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 5 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "qt-py-esp32c3",
    "name": "Adafruit QT Py ESP32-C3",
    "manufacturer": "Adafruit (Espressif)",
    "architecture": "32-bit single-core RISC-V",
    "short_description": "A thumbnail-sized ESP32-C3 board with a STEMMA QT connector for cable-free sensor hookup.",
    "long_description": "QT Py boards shrink a full dev board down to a tiny form factor, and the ESP32-C3 version adds Wi-Fi/BLE plus Adafruit's STEMMA QT connector for tool-free I2C sensor connections.",
    "clock_speed": "Up to 160 MHz",
    "flash_memory": "4 MB",
    "ram": "400 KB SRAM",
    "operating_voltage": "3.3V (5V via USB)",
    "io_pins_count": 11,
    "adc_channels": "4 (12-bit)",
    "communication": "WiFi,BLE,I2C,SPI,UART",
    "package_type": "Module on board",
    "price_range": "\u20b9450 \u2013 \u20b9700",
    "buy_url": "https://www.adafruit.com/product/5405",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32-c3_datasheet_en.pdf"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (3.3V (5V via USB))."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "5",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "6",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "7",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "8",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "ANT",
      "pin_name": "ANTENNA / RF",
      "pin_type": "other",
      "description": "RF antenna feed or connection point for the integrated radio."
    },
    {
      "pin_number": "9",
      "pin_name": "AIN0 (representative)",
      "pin_type": "adc",
      "description": "One of the chip's 4 (12-bit) analog input channels."
    },
    {
      "pin_number": "10",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 11 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "11",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "orange-pi-rv2",
    "name": "GD32VF103 (BumbleBee core reference)",
    "manufacturer": "GigaDevice",
    "architecture": "32-bit RISC-V (Bumblebee core)",
    "short_description": "Bare reference part behind several inexpensive RISC-V learning boards.",
    "long_description": "This is the base GD32VF103 chip in its reference configuration, the same silicon used across several inexpensive RISC-V learning boards that pair it with USB-serial and a breadboard-friendly layout.",
    "clock_speed": "Up to 108 MHz",
    "flash_memory": "128 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "2.6V \u2013 3.6V",
    "io_pins_count": 37,
    "adc_channels": "10 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-48",
    "price_range": "\u20b9280 \u2013 \u20b9480",
    "buy_url": "https://www.gigadevice.com/microcontroller/gd32vf103cbt6/",
    "datasheet_url": "https://www.gigadevice.com/datasheet/gd32vf103xxxx-datasheet/"
  },
  "pins": [
    {
      "pin_number": "1",
      "pin_name": "VDD / VCC",
      "pin_type": "power",
      "description": "Main supply voltage input (2.6V \u2013 3.6V)."
    },
    {
      "pin_number": "2",
      "pin_name": "GND / VSS",
      "pin_type": "ground",
      "description": "Ground reference (one of possibly several ground pins)."
    },
    {
      "pin_number": "3",
      "pin_name": "RESET / NRST",
      "pin_type": "other",
      "description": "Chip reset line (polarity and internal pull vary by part)."
    },
    {
      "pin_number": "4",
      "pin_name": "D-",
      "pin_type": "comm",
      "description": "USB data minus line."
    },
    {
      "pin_number": "5",
      "pin_name": "D+",
      "pin_type": "comm",
      "description": "USB data plus line."
    },
    {
      "pin_number": "6",
      "pin_name": "TX",
      "pin_type": "comm",
      "description": "UART transmit line."
    },
    {
      "pin_number": "7",
      "pin_name": "RX",
      "pin_type": "comm",
      "description": "UART receive line."
    },
    {
      "pin_number": "8",
      "pin_name": "SDA",
      "pin_type": "comm",
      "description": "I2C data line."
    },
    {
      "pin_number": "9",
      "pin_name": "SCL",
      "pin_type": "comm",
      "description": "I2C clock line."
    },
    {
      "pin_number": "10",
      "pin_name": "SCK / MOSI / MISO",
      "pin_type": "comm",
      "description": "SPI clock and data lines (grouped; exact pin numbers vary by package)."
    },
    {
      "pin_number": "11",
      "pin_name": "CAN_TX / CAN_RX",
      "pin_type": "comm",
      "description": "CAN bus transmit/receive lines."
    },
    {
      "pin_number": "12",
      "pin_name": "GPIOx (representative)",
      "pin_type": "gpio",
      "description": "One of 37 general-purpose I/O pins; many are also PWM-capable \u2014 see the datasheet for the full pin map."
    },
    {
      "pin_number": "13",
      "pin_name": "BOOT / PROG",
      "pin_type": "other",
      "description": "Boot-mode select or programming/debug interface pin."
    }
  ]
},
{
  "mc": {
    "slug": "rp2040-pico",
    "name": "RP2040 (Raspberry Pi Pico)",
    "manufacturer": "Raspberry Pi Ltd",
    "architecture": "32-bit ARM Cortex-M0+ (dual-core)",
    "short_description": "Cheap, well-documented dual-core chip with the unique PIO peripheral for custom I/O.",
    "long_description": "The RP2040 is Raspberry Pi's own silicon: a dual-core Cortex-M0+ running up to 133 MHz with 264 KB of on-chip SRAM and no internal flash (it boots from external QSPI flash). Its standout feature is the Programmable I/O (PIO) block, which lets developers implement custom high-speed protocols in software. Backed by excellent documentation and the C/C++ SDK plus MicroPython support, it's become a favourite for both beginners and advanced embedded work.",
    "clock_speed": "Up to 133 MHz",
    "flash_memory": "2 MB external QSPI (on Pico board)",
    "ram": "264 KB SRAM",
    "operating_voltage": "1.8V – 3.3V (board regulates from USB 5V)",
    "io_pins_count": 26,
    "adc_channels": "4 (12-bit, incl. internal temp sensor)",
    "communication": "I2C,SPI,UART,USB,PIO",
    "package_type": "QFN-56",
    "price_range": "₹350 – ₹600 (Pico board)",
    "buy_url": "https://www.raspberrypi.com/products/raspberry-pi-pico/",
    "datasheet_url": "https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "GP0", "pin_type": "gpio", "description": "General-purpose I/O, default UART0 TX." },
    { "pin_number": "2", "pin_name": "GP1", "pin_type": "gpio", "description": "General-purpose I/O, default UART0 RX." },
    { "pin_number": "3", "pin_name": "GND", "pin_type": "ground", "description": "Ground pin (multiple across the board)." },
    { "pin_number": "4", "pin_name": "GP2", "pin_type": "comm", "description": "Default I2C1 SDA line." },
    { "pin_number": "5", "pin_name": "GP3", "pin_type": "comm", "description": "Default I2C1 SCL line." },
    { "pin_number": "6", "pin_name": "GP4", "pin_type": "gpio", "description": "General-purpose I/O, PIO-capable." },
    { "pin_number": "7", "pin_name": "GP5", "pin_type": "gpio", "description": "General-purpose I/O, PIO-capable." },
    { "pin_number": "11", "pin_name": "GP8", "pin_type": "comm", "description": "Default SPI1 RX (MISO)." },
    { "pin_number": "14", "pin_name": "GP10", "pin_type": "comm", "description": "Default SPI1 SCK." },
    { "pin_number": "15", "pin_name": "GP11", "pin_type": "comm", "description": "Default SPI1 TX (MOSI)." },
    { "pin_number": "22", "pin_name": "GP16", "pin_type": "pwm", "description": "General-purpose I/O; every GPIO can drive PWM via the onboard PWM slices." },
    { "pin_number": "31", "pin_name": "ADC0 (GP26)", "pin_type": "adc", "description": "12-bit analog input channel 0." },
    { "pin_number": "36", "pin_name": "3V3", "pin_type": "power", "description": "3.3V regulated output/supply rail." },
    { "pin_number": "40", "pin_name": "VBUS", "pin_type": "power", "description": "5V USB input." },
    { "pin_number": "30", "pin_name": "RUN", "pin_type": "other", "description": "Chip enable/reset; pull low to reset." },
    { "pin_number": "34", "pin_name": "SWCLK/SWDIO", "pin_type": "other", "description": "SWD debug interface pins." }
  ]
},
{
  "mc": {
    "slug": "attiny1614",
    "name": "ATtiny1614",
    "manufacturer": "Microchip Technology",
    "architecture": "8-bit AVR (megaAVR 0-series)",
    "short_description": "Modern low-pin-count AVR with a real UART, decent ADC, and no bootloader hassle.",
    "long_description": "The ATtiny1614 is part of Microchip's megaAVR 0-series, a modern refresh of the classic ATtiny line. It packs a proper hardware UART, SPI and I2C peripherals, a 12-bit ADC and a flexible Event System into a tiny 14-pin package, making it a popular upgrade path from the older ATtiny85 for small, low-power projects programmed via UPDI.",
    "clock_speed": "Up to 20 MHz (internal oscillator)",
    "flash_memory": "16 KB",
    "ram": "2 KB SRAM",
    "operating_voltage": "1.8V – 5.5V",
    "io_pins_count": 12,
    "adc_channels": "11 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "SOIC-14 / QFN-14 / TSSOP-14",
    "price_range": "₹60 – ₹120",
    "buy_url": "https://www.microchip.com/en-us/product/attiny1614",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/ATtiny1614-16-17-DataSheet-DS40002204A.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "VDD", "pin_type": "power", "description": "Supply voltage input, 1.8V – 5.5V." },
    { "pin_number": "2", "pin_name": "PA4", "pin_type": "gpio", "description": "General I/O, ADC input, PWM (TCA0 WO4)." },
    { "pin_number": "3", "pin_name": "PA5", "pin_type": "gpio", "description": "General I/O, ADC input, PWM (TCA0 WO5)." },
    { "pin_number": "4", "pin_name": "PA6", "pin_type": "gpio", "description": "General I/O, ADC input, PWM." },
    { "pin_number": "5", "pin_name": "PA7", "pin_type": "gpio", "description": "General I/O, ADC input, PWM." },
    { "pin_number": "6", "pin_name": "PB3", "pin_type": "comm", "description": "USART0 TX (default)." },
    { "pin_number": "7", "pin_name": "PB2", "pin_type": "comm", "description": "USART0 RX (default)." },
    { "pin_number": "8", "pin_name": "PB1", "pin_type": "comm", "description": "I2C SDA (default)." },
    { "pin_number": "9", "pin_name": "PB0", "pin_type": "comm", "description": "I2C SCL (default)." },
    { "pin_number": "10", "pin_name": "PA1", "pin_type": "comm", "description": "SPI MOSI (default)." },
    { "pin_number": "11", "pin_name": "PA2", "pin_type": "comm", "description": "SPI MISO (default)." },
    { "pin_number": "12", "pin_name": "PA3", "pin_type": "comm", "description": "SPI SCK (default)." },
    { "pin_number": "13", "pin_name": "PA0 (UPDI)", "pin_type": "other", "description": "Unified Program and Debug Interface, used for programming." },
    { "pin_number": "14", "pin_name": "GND", "pin_type": "ground", "description": "Ground reference." }
  ]
},
{
  "mc": {
    "slug": "lpc1114fn28",
    "name": "LPC1114FN28",
    "manufacturer": "NXP Semiconductors",
    "architecture": "32-bit ARM Cortex-M0",
    "short_description": "A real ARM Cortex-M0 in a breadboard-friendly DIP-28 package.",
    "long_description": "The LPC1114FN28 is unusual among ARM microcontrollers in shipping in a hobbyist-friendly through-hole DIP-28 package, letting it drop directly into a breadboard like an old-school 8-bit chip while offering a genuine Cortex-M0 core. It's often used to teach the jump from AVR/PIC to ARM without needing a dev board or SMD soldering.",
    "clock_speed": "Up to 50 MHz",
    "flash_memory": "32 KB",
    "ram": "4 KB SRAM",
    "operating_voltage": "2.1V – 3.6V",
    "io_pins_count": 24,
    "adc_channels": "8 (10-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "DIP-28 (PDIP)",
    "price_range": "₹150 – ₹300",
    "buy_url": "https://www.nxp.com/products/LPC1114FN28",
    "datasheet_url": "https://www.nxp.com/docs/en/data-sheet/LPC111X.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "RESET", "pin_type": "other", "description": "Active-low external reset input." },
    { "pin_number": "3", "pin_name": "PIO0_0", "pin_type": "gpio", "description": "General I/O, also usable as ISP entry pin." },
    { "pin_number": "5", "pin_name": "PIO0_2", "pin_type": "comm", "description": "SSP0 SCK (SPI clock), alternate function." },
    { "pin_number": "6", "pin_name": "PIO0_3", "pin_type": "gpio", "description": "General I/O / USB VBUS sense on variants." },
    { "pin_number": "7", "pin_name": "PIO0_4", "pin_type": "comm", "description": "I2C SCL (default)." },
    { "pin_number": "8", "pin_name": "PIO0_5", "pin_type": "comm", "description": "I2C SDA (default)." },
    { "pin_number": "9", "pin_name": "VSS", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "10", "pin_name": "VDD", "pin_type": "power", "description": "2.1V – 3.6V supply." },
    { "pin_number": "15", "pin_name": "PIO1_6", "pin_type": "comm", "description": "UART0 RXD (default)." },
    { "pin_number": "16", "pin_name": "PIO1_7", "pin_type": "comm", "description": "UART0 TXD (default)." },
    { "pin_number": "21", "pin_name": "PIO2_11/AD0", "pin_type": "adc", "description": "10-bit analog input channel 0." },
    { "pin_number": "24", "pin_name": "SWCLK", "pin_type": "other", "description": "Serial Wire debug clock." },
    { "pin_number": "25", "pin_name": "SWDIO", "pin_type": "other", "description": "Serial Wire debug data." }
  ]
},
{
  "mc": {
    "slug": "samd11d14a",
    "name": "ATSAMD11D14A",
    "manufacturer": "Microchip Technology",
    "architecture": "32-bit ARM Cortex-M0+",
    "short_description": "A tiny 14-pin Cortex-M0+ with native USB, good for compact USB gadgets.",
    "long_description": "The ATSAMD11D14A shrinks the SAM D architecture down to a 14-pin package while keeping native USB device support, making it a good fit for small USB dongles, adapters and programmer boards where a full-size SAMD21 would be overkill.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "16 KB",
    "ram": "4 KB SRAM",
    "operating_voltage": "1.62V – 3.63V",
    "io_pins_count": 10,
    "adc_channels": "6 (12-bit)",
    "communication": "I2C,SPI,UART,USB",
    "package_type": "QFN-14 / TSSOP-14",
    "price_range": "₹90 – ₹180",
    "buy_url": "https://www.microchip.com/en-us/product/atsamd11d14a",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/SAM_D11_Family_Data_Sheet_DS40001950B.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "PA24 (USB D-)", "pin_type": "comm", "description": "USB data minus line." },
    { "pin_number": "2", "pin_name": "PA25 (USB D+)", "pin_type": "comm", "description": "USB data plus line." },
    { "pin_number": "3", "pin_name": "GND", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "4", "pin_name": "PA02", "pin_type": "adc", "description": "12-bit ADC input, channel 0." },
    { "pin_number": "5", "pin_name": "PA04", "pin_type": "gpio", "description": "General I/O, PWM-capable via TCC." },
    { "pin_number": "6", "pin_name": "PA05", "pin_type": "gpio", "description": "General I/O, PWM-capable via TCC." },
    { "pin_number": "7", "pin_name": "PA08", "pin_type": "comm", "description": "SERCOM0 I2C SDA (default)." },
    { "pin_number": "8", "pin_name": "PA09", "pin_type": "comm", "description": "SERCOM0 I2C SCL (default)." },
    { "pin_number": "9", "pin_name": "PA14", "pin_type": "comm", "description": "SERCOM1 UART TX (default)." },
    { "pin_number": "10", "pin_name": "PA15", "pin_type": "comm", "description": "SERCOM1 UART RX (default)." },
    { "pin_number": "12", "pin_name": "SWCLK", "pin_type": "other", "description": "Serial Wire debug clock." },
    { "pin_number": "13", "pin_name": "SWDIO", "pin_type": "other", "description": "Serial Wire debug data." },
    { "pin_number": "14", "pin_name": "VDD", "pin_type": "power", "description": "1.62V – 3.63V supply." }
  ]
},
{
  "mc": {
    "slug": "msp430fr5994",
    "name": "MSP430FR5994",
    "manufacturer": "Texas Instruments",
    "architecture": "16-bit MSP430 (FRAM)",
    "short_description": "FRAM-based ultra-low-power chip that writes like RAM but keeps data like flash.",
    "long_description": "The MSP430FR5994 uses Ferroelectric RAM (FRAM) instead of conventional flash, giving it fast, low-energy, effectively unlimited-endurance non-volatile storage that can be written a byte at a time. Combined with MSP430's famously low sleep currents, it's aimed at battery-powered sensing and data-logging applications that need to save state instantly on power loss.",
    "clock_speed": "Up to 16 MHz",
    "flash_memory": "256 KB FRAM (non-volatile, byte-writable)",
    "ram": "8 KB SRAM",
    "operating_voltage": "1.8V – 3.6V",
    "io_pins_count": 83,
    "adc_channels": "16 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "LQFP-100",
    "price_range": "₹500 – ₹900 (LaunchPad)",
    "buy_url": "https://www.ti.com/product/MSP430FR5994",
    "datasheet_url": "https://www.ti.com/lit/ds/symlink/msp430fr5994.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "DVCC", "pin_type": "power", "description": "Digital supply voltage, 1.8V – 3.6V." },
    { "pin_number": "2", "pin_name": "DVSS", "pin_type": "ground", "description": "Digital ground reference." },
    { "pin_number": "3", "pin_name": "RST/NMI", "pin_type": "other", "description": "Reset or non-maskable interrupt input." },
    { "pin_number": "8", "pin_name": "P1.0", "pin_type": "gpio", "description": "General I/O, ADC12 channel A0." },
    { "pin_number": "9", "pin_name": "P1.1", "pin_type": "comm", "description": "eUSCI_A0 UART TXD (default)." },
    { "pin_number": "10", "pin_name": "P1.2", "pin_type": "comm", "description": "eUSCI_A0 UART RXD (default)." },
    { "pin_number": "18", "pin_name": "P1.6", "pin_type": "comm", "description": "eUSCI_B0 I2C SDA (default)." },
    { "pin_number": "19", "pin_name": "P1.7", "pin_type": "comm", "description": "eUSCI_B0 I2C SCL (default)." },
    { "pin_number": "22", "pin_name": "P2.2", "pin_type": "comm", "description": "eUSCI_B1 SPI SCLK (default)." },
    { "pin_number": "23", "pin_name": "P2.3", "pin_type": "pwm", "description": "General I/O, Timer_B PWM-capable." },
    { "pin_number": "40", "pin_name": "P5.0", "pin_type": "adc", "description": "ADC12 channel A8." },
    { "pin_number": "60", "pin_name": "TDO/P3.0", "pin_type": "other", "description": "JTAG test data output, shared with GPIO." },
    { "pin_number": "61", "pin_name": "TDI/P3.1", "pin_type": "other", "description": "JTAG test data input, shared with GPIO." }
  ]
},
{
  "mc": {
    "slug": "stm32c011f4",
    "name": "STM32C011F4",
    "manufacturer": "STMicroelectronics",
    "architecture": "32-bit ARM Cortex-M0+",
    "short_description": "ST's ultra-cheap value line — a full 32-bit STM32 for near-8-bit prices.",
    "long_description": "The STM32C0 series is STMicroelectronics' push to make 32-bit ARM Cortex-M0+ chips cost-competitive with 8-bit microcontrollers. The STM32C011F4 keeps the familiar STM32 peripheral set and toolchain (HAL, CubeMX) in a small, inexpensive package, making it an easy drop-in upgrade for designs that outgrew an 8-bit part but don't need much horsepower.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "16 KB",
    "ram": "6 KB SRAM",
    "operating_voltage": "2.0V – 3.6V",
    "io_pins_count": 15,
    "adc_channels": "8 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "TSSOP-20",
    "price_range": "₹40 – ₹90",
    "buy_url": "https://www.st.com/en/microcontrollers-microprocessors/stm32c011f4.html",
    "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32c011f4.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "VDD", "pin_type": "power", "description": "2.0V – 3.6V supply." },
    { "pin_number": "2", "pin_name": "PA14/BOOT0", "pin_type": "other", "description": "Boot mode select, also SWCLK after boot." },
    { "pin_number": "3", "pin_name": "PA13", "pin_type": "other", "description": "SWDIO debug data line." },
    { "pin_number": "6", "pin_name": "PA0", "pin_type": "adc", "description": "12-bit ADC input, channel 0." },
    { "pin_number": "7", "pin_name": "PA1", "pin_type": "adc", "description": "12-bit ADC input, channel 1." },
    { "pin_number": "9", "pin_name": "PA9", "pin_type": "comm", "description": "USART1 TX (default)." },
    { "pin_number": "10", "pin_name": "PA10", "pin_type": "comm", "description": "USART1 RX (default)." },
    { "pin_number": "11", "pin_name": "PA11", "pin_type": "comm", "description": "I2C1 SCL (remap option)." },
    { "pin_number": "12", "pin_name": "PA12", "pin_type": "comm", "description": "I2C1 SDA (remap option)." },
    { "pin_number": "13", "pin_name": "PA5", "pin_type": "comm", "description": "SPI1 SCK (default)." },
    { "pin_number": "14", "pin_name": "PA6", "pin_type": "comm", "description": "SPI1 MISO (default)." },
    { "pin_number": "15", "pin_name": "PA7", "pin_type": "comm", "description": "SPI1 MOSI (default)." },
    { "pin_number": "16", "pin_name": "PB1", "pin_type": "pwm", "description": "TIM3-driven PWM-capable GPIO." },
    { "pin_number": "20", "pin_name": "VSS", "pin_type": "ground", "description": "Ground reference." }
  ]
},
{
  "mc": {
    "slug": "efm32pg22",
    "name": "EFM32PG22 (Pearl Gecko)",
    "manufacturer": "Silicon Labs",
    "architecture": "32-bit ARM Cortex-M33",
    "short_description": "Ultra-low-power Cortex-M33 with hardware security, aimed at battery-powered edge devices.",
    "long_description": "The EFM32PG22 'Pearl Gecko' pairs a Cortex-M33 core (with TrustZone) with Silicon Labs' energy-management peripherals, letting it wake from deep sleep in microseconds. It's built for coin-cell and battery-powered sensor nodes and secure IoT endpoints that still need real cryptographic acceleration.",
    "clock_speed": "Up to 76.8 MHz",
    "flash_memory": "512 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "1.71V – 3.8V",
    "io_pins_count": 31,
    "adc_channels": "IADC, up to 20 channels (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "QFN-32",
    "price_range": "₹250 – ₹450",
    "buy_url": "https://www.silabs.com/wireless/zigbee/efm32pg22-series-2-socs",
    "datasheet_url": "https://www.silabs.com/documents/public/data-sheets/efm32pg22-datasheet.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "VDD", "pin_type": "power", "description": "1.71V – 3.8V supply." },
    { "pin_number": "2", "pin_name": "GND", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "3", "pin_name": "RESETn", "pin_type": "other", "description": "Active-low reset input." },
    { "pin_number": "5", "pin_name": "PA0", "pin_type": "adc", "description": "IADC analog input channel." },
    { "pin_number": "6", "pin_name": "PA1", "pin_type": "adc", "description": "IADC analog input channel." },
    { "pin_number": "11", "pin_name": "PB0", "pin_type": "comm", "description": "USART0 TX (default)." },
    { "pin_number": "12", "pin_name": "PB1", "pin_type": "comm", "description": "USART0 RX (default)." },
    { "pin_number": "15", "pin_name": "PC0", "pin_type": "comm", "description": "I2C0 SDA (default)." },
    { "pin_number": "16", "pin_name": "PC1", "pin_type": "comm", "description": "I2C0 SCL (default)." },
    { "pin_number": "20", "pin_name": "PC4", "pin_type": "comm", "description": "USART1 SPI MOSI (default)." },
    { "pin_number": "21", "pin_name": "PC5", "pin_type": "comm", "description": "USART1 SPI MISO (default)." },
    { "pin_number": "26", "pin_name": "PD2", "pin_type": "pwm", "description": "TIMER-driven PWM-capable GPIO." },
    { "pin_number": "31", "pin_name": "SWCLK", "pin_type": "other", "description": "Serial Wire debug clock." },
    { "pin_number": "32", "pin_name": "SWDIO", "pin_type": "other", "description": "Serial Wire debug data." }
  ]
},
{
  "mc": {
    "slug": "rl78g14",
    "name": "RL78/G14",
    "manufacturer": "Renesas Electronics",
    "architecture": "16-bit RL78",
    "short_description": "Low-power 16-bit chip with a huge peripheral count, common in Japanese industrial gear.",
    "long_description": "The RL78/G14 is a mid-range member of Renesas' RL78 family, built for a balance of low power consumption and rich analog/timer peripherals. It's widely used in appliances, industrial control panels and metering equipment, often praised for its efficient instruction set and built-in self-programming flash.",
    "clock_speed": "Up to 32 MHz",
    "flash_memory": "Up to 512 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "1.6V – 5.5V",
    "io_pins_count": 58,
    "adc_channels": "24 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "LQFP-64",
    "price_range": "₹200 – ₹380",
    "buy_url": "https://www.renesas.com/en/products/microcontrollers-microprocessors/rl78-low-power-16-bit-mcus/rl78g14",
    "datasheet_url": "https://www.renesas.com/en/document/dst/rl78g14-datasheet"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "P40/TOOLRxD", "pin_type": "other", "description": "On-chip debug/programming receive line." },
    { "pin_number": "2", "pin_name": "P41/TOOLTxD", "pin_type": "other", "description": "On-chip debug/programming transmit line." },
    { "pin_number": "3", "pin_name": "RESET", "pin_type": "other", "description": "Active-low reset input." },
    { "pin_number": "10", "pin_name": "P20/ANI0", "pin_type": "adc", "description": "12-bit ADC input channel 0." },
    { "pin_number": "11", "pin_name": "P21/ANI1", "pin_type": "adc", "description": "12-bit ADC input channel 1." },
    { "pin_number": "20", "pin_name": "P12/TxD0", "pin_type": "comm", "description": "UART0 transmit (default)." },
    { "pin_number": "21", "pin_name": "P13/RxD0", "pin_type": "comm", "description": "UART0 receive (default)." },
    { "pin_number": "22", "pin_name": "P14/SDA00", "pin_type": "comm", "description": "I2C data line (default)." },
    { "pin_number": "23", "pin_name": "P15/SCL00", "pin_type": "comm", "description": "I2C clock line (default)." },
    { "pin_number": "24", "pin_name": "P16/SO00", "pin_type": "comm", "description": "SPI-mode serial output." },
    { "pin_number": "25", "pin_name": "P17/SI00", "pin_type": "comm", "description": "SPI-mode serial input." },
    { "pin_number": "30", "pin_name": "P70/TO01", "pin_type": "pwm", "description": "Timer array unit PWM output." },
    { "pin_number": "32", "pin_name": "VDD", "pin_type": "power", "description": "1.6V – 5.5V supply." },
    { "pin_number": "33", "pin_name": "VSS", "pin_type": "ground", "description": "Ground reference." }
  ]
},
{
  "mc": {
    "slug": "ch32v203",
    "name": "CH32V203",
    "manufacturer": "WCH (Nanjing Qinheng Microelectronics)",
    "architecture": "32-bit RISC-V (QingKe V4)",
    "short_description": "USB and CAN-equipped RISC-V chip, pin-compatible with STM32F103 designs.",
    "long_description": "The CH32V203 is WCH's mainstream RISC-V microcontroller, offering USB 2.0 full-speed, CAN, and a peripheral set close enough to the STM32F103 that it's often used as a cheaper, RISC-V-based drop-in for existing '103 board layouts. It's popular in China's hobbyist and low-cost commercial boards.",
    "clock_speed": "Up to 144 MHz",
    "flash_memory": "64 KB",
    "ram": "20 KB SRAM",
    "operating_voltage": "2.5V – 3.6V (5V tolerant I/O)",
    "io_pins_count": 37,
    "adc_channels": "10 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN",
    "package_type": "LQFP-48",
    "price_range": "₹80 – ₹150",
    "buy_url": "https://www.wch-ic.com/products/CH32V203.html",
    "datasheet_url": "https://www.wch-ic.com/downloads/CH32V203DS0_PDF.html"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "VBAT", "pin_type": "power", "description": "Backup battery supply for RTC/backup registers." },
    { "pin_number": "2", "pin_name": "PC13", "pin_type": "gpio", "description": "General I/O, RTC output capable." },
    { "pin_number": "8", "pin_name": "PA0", "pin_type": "adc", "description": "12-bit ADC input, channel 0." },
    { "pin_number": "9", "pin_name": "PA1", "pin_type": "adc", "description": "12-bit ADC input, channel 1." },
    { "pin_number": "30", "pin_name": "PA9", "pin_type": "comm", "description": "USART1 TX (default)." },
    { "pin_number": "31", "pin_name": "PA10", "pin_type": "comm", "description": "USART1 RX (default)." },
    { "pin_number": "32", "pin_name": "PA11", "pin_type": "comm", "description": "USB D- line." },
    { "pin_number": "33", "pin_name": "PA12", "pin_type": "comm", "description": "USB D+ line." },
    { "pin_number": "42", "pin_name": "PB6", "pin_type": "comm", "description": "I2C1 SCL (default)." },
    { "pin_number": "43", "pin_name": "PB7", "pin_type": "comm", "description": "I2C1 SDA (default)." },
    { "pin_number": "18", "pin_name": "PA5", "pin_type": "comm", "description": "SPI1 SCK (default)." },
    { "pin_number": "19", "pin_name": "PA6", "pin_type": "comm", "description": "SPI1 MISO (default)." },
    { "pin_number": "20", "pin_name": "PA7", "pin_type": "comm", "description": "SPI1 MOSI (default)." },
    { "pin_number": "45", "pin_name": "PB8", "pin_type": "comm", "description": "CAN RX (default)." },
    { "pin_number": "46", "pin_name": "PB9", "pin_type": "comm", "description": "CAN TX (default)." },
    { "pin_number": "48", "pin_name": "PB0", "pin_type": "pwm", "description": "TIM3-driven PWM-capable GPIO." }
  ]
},
{
  "mc": {
    "slug": "pic12f675",
    "name": "PIC12F675",
    "manufacturer": "Microchip Technology",
    "architecture": "8-bit PIC (baseline enhanced mid-range)",
    "short_description": "A classic 8-pin PIC — about as small and simple as a real microcontroller gets.",
    "long_description": "The PIC12F675 is a tiny 8-pin baseline PIC that's been a staple of simple embedded projects (blinking LEDs, basic sensors, small state machines) for decades. With no hardware UART/SPI/I2C, it's meant for the smallest, cheapest jobs where a full-featured chip would be overkill, and it's still widely taught as an intro to PIC assembly and the MPLAB toolchain.",
    "clock_speed": "Up to 4 MHz (internal oscillator)",
    "flash_memory": "1.75 KB (1024 words)",
    "ram": "64 bytes",
    "operating_voltage": "2.0V – 5.5V",
    "io_pins_count": 6,
    "adc_channels": "4 (10-bit)",
    "communication": "None (bit-banged only)",
    "package_type": "DIP-8 / SOIC-8",
    "price_range": "₹40 – ₹80",
    "buy_url": "https://www.microchip.com/en-us/product/pic12f675",
    "datasheet_url": "https://ww1.microchip.com/downloads/en/DeviceDoc/41190C.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "VDD", "pin_type": "power", "description": "2.0V – 5.5V supply." },
    { "pin_number": "2", "pin_name": "GP5/OSC1", "pin_type": "gpio", "description": "General I/O, or external clock input." },
    { "pin_number": "3", "pin_name": "GP4/OSC2", "pin_type": "gpio", "description": "General I/O, or external clock output." },
    { "pin_number": "4", "pin_name": "GP3/MCLR", "pin_type": "other", "description": "Input-only pin; can be configured as external reset." },
    { "pin_number": "5", "pin_name": "GP2/AN2", "pin_type": "adc", "description": "General I/O or 10-bit ADC channel 2." },
    { "pin_number": "6", "pin_name": "GP1/AN1", "pin_type": "adc", "description": "General I/O or 10-bit ADC channel 1." },
    { "pin_number": "7", "pin_name": "GP0/AN0", "pin_type": "adc", "description": "General I/O or 10-bit ADC channel 0." },
    { "pin_number": "8", "pin_name": "VSS", "pin_type": "ground", "description": "Ground reference." }
  ]
},
{
  "mc": {
    "slug": "nrf54l15",
    "name": "nRF54L15",
    "manufacturer": "Nordic Semiconductor",
    "architecture": "32-bit ARM Cortex-M33 (+ RISC-V FLPR coprocessor)",
    "short_description": "Nordic's newest ultra-low-power BLE SoC — a Cortex-M33 app core paired with a RISC-V coprocessor for offloaded peripheral tasks.",
    "long_description": "The nRF54L15 is Nordic's successor to the nRF52 series, built around an Arm Cortex-M33 application core plus a small RISC-V 'FLPR' core that can run tight peripheral loops (like software SPI or LED patterns) without waking the main CPU. It supports Bluetooth LE 5.4, Bluetooth Mesh, Thread, Zigbee and Matter, with TrustZone-based security and some of the lowest active/sleep current figures Nordic has shipped.",
    "clock_speed": "Up to 128 MHz",
    "flash_memory": "1.5 MB",
    "ram": "256 KB RAM",
    "operating_voltage": "1.7V – 3.6V",
    "io_pins_count": 42,
    "adc_channels": "8 (12-bit SAADC)",
    "communication": "BLE,I2C,SPI,UART,I2S",
    "package_type": "WLCSP-100 / QFN-58",
    "price_range": "₹350 – ₹650",
    "buy_url": "https://www.nordicsemi.com/Products/nRF54L15",
    "datasheet_url": "https://docs.nordicsemi.com/bundle/ps_nrf54L15/page/keyfeatures_html5.html"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "VDD", "pin_type": "power", "description": "1.7V – 3.6V main supply." },
    { "pin_number": "2", "pin_name": "VSS", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "3", "pin_name": "SWDIO", "pin_type": "other", "description": "Serial Wire debug data." },
    { "pin_number": "4", "pin_name": "SWCLK", "pin_type": "other", "description": "Serial Wire debug clock." },
    { "pin_number": "5", "pin_name": "P1.04", "pin_type": "gpio", "description": "General-purpose I/O, low-power GPIO bank." },
    { "pin_number": "6", "pin_name": "P1.05", "pin_type": "gpio", "description": "General-purpose I/O, low-power GPIO bank." },
    { "pin_number": "7", "pin_name": "AIN0", "pin_type": "adc", "description": "12-bit SAADC input channel 0." },
    { "pin_number": "8", "pin_name": "AIN1", "pin_type": "adc", "description": "12-bit SAADC input channel 1." },
    { "pin_number": "9", "pin_name": "TXD", "pin_type": "comm", "description": "UARTE0 transmit (default)." },
    { "pin_number": "10", "pin_name": "RXD", "pin_type": "comm", "description": "UARTE0 receive (default)." },
    { "pin_number": "11", "pin_name": "SDA", "pin_type": "comm", "description": "TWIM/I2C data line (default)." },
    { "pin_number": "12", "pin_name": "SCL", "pin_type": "comm", "description": "TWIM/I2C clock line (default)." },
    { "pin_number": "13", "pin_name": "SCK", "pin_type": "comm", "description": "SPIM serial clock (default)." },
    { "pin_number": "14", "pin_name": "RESET", "pin_type": "other", "description": "Active-low chip reset." }
  ]
},
{
  "mc": {
    "slug": "esp32-p4",
    "name": "ESP32-P4",
    "manufacturer": "Espressif Systems",
    "architecture": "32-bit dual-core RISC-V (+ low-power RISC-V core)",
    "short_description": "Espressif's first high-performance MCU without built-in wireless — dual RISC-V cores plus MIPI/USB peripherals for camera and display work.",
    "long_description": "The ESP32-P4 breaks from the rest of the ESP32 family by dropping Wi-Fi/Bluetooth entirely and instead focusing on raw compute: dual high-performance RISC-V cores, MIPI-CSI/DSI for camera and display, a hardware H.264 encoder, and high-speed USB OTG 2.0. It's meant to be paired with an ESP32-C6 or similar over SDIO/UART when wireless connectivity is needed, splitting 'compute' and 'radio' across two chips.",
    "clock_speed": "Up to 400 MHz",
    "flash_memory": "External QSPI/OSPI flash (no internal flash)",
    "ram": "768 KB SRAM (+ up to 32 MB external PSRAM)",
    "operating_voltage": "3.0V – 3.6V",
    "io_pins_count": 55,
    "adc_channels": "2 (12-bit)",
    "communication": "SPI,UART,I2C,I2S,USB,CAN",
    "package_type": "LFBGA-289 (module on dev board)",
    "price_range": "₹450 – ₹900",
    "buy_url": "https://www.espressif.com/en/products/socs/esp32-p4",
    "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32-p4_datasheet_en.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "3V3", "pin_type": "power", "description": "3.3V power input/output for the board." },
    { "pin_number": "2", "pin_name": "GND", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "3", "pin_name": "EN", "pin_type": "other", "description": "Chip enable, active high." },
    { "pin_number": "4", "pin_name": "GPIO0", "pin_type": "gpio", "description": "General GPIO, also a boot-mode strapping pin." },
    { "pin_number": "5", "pin_name": "GPIO1", "pin_type": "adc", "description": "General GPIO, ADC1 channel 0." },
    { "pin_number": "6", "pin_name": "GPIO34", "pin_type": "comm", "description": "USB OTG D- line." },
    { "pin_number": "7", "pin_name": "GPIO35", "pin_type": "comm", "description": "USB OTG D+ line." },
    { "pin_number": "8", "pin_name": "GPIO36", "pin_type": "comm", "description": "TWAI (CAN) TX (default)." },
    { "pin_number": "9", "pin_name": "GPIO37", "pin_type": "comm", "description": "TWAI (CAN) RX (default)." },
    { "pin_number": "10", "pin_name": "GPIO8", "pin_type": "comm", "description": "Default I2C SDA line." },
    { "pin_number": "11", "pin_name": "GPIO9", "pin_type": "comm", "description": "Default I2C SCL line." },
    { "pin_number": "12", "pin_name": "GPIO14", "pin_type": "comm", "description": "UART0 TX (default)." },
    { "pin_number": "13", "pin_name": "GPIO15", "pin_type": "comm", "description": "UART0 RX (default)." },
    { "pin_number": "14", "pin_name": "GPIO20", "pin_type": "pwm", "description": "LEDC/MCPWM-capable GPIO." }
  ]
},
{
  "mc": {
    "slug": "pic18f47q10",
    "name": "PIC18F47Q10",
    "manufacturer": "Microchip Technology",
    "architecture": "8-bit PIC18 (Q-series, Core Independent Peripherals)",
    "short_description": "A modern 8-bit PIC18 with Core Independent Peripherals that keep running logic without any CPU intervention.",
    "long_description": "The PIC18F47Q10 belongs to Microchip's Q-series refresh of the PIC18 line, adding Core Independent Peripherals (CLC, CWG, NCO, and similar) that can implement small pieces of hardware logic entirely outside the CPU. That makes it popular for appliance and simple motor-control designs that want deterministic timing without writing an interrupt-heavy firmware loop.",
    "clock_speed": "Up to 64 MHz",
    "flash_memory": "128 KB",
    "ram": "8 KB SRAM",
    "operating_voltage": "1.8V – 5.5V",
    "io_pins_count": 36,
    "adc_channels": "35 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "PDIP-40 / TQFP-44 / QFN-40",
    "price_range": "₹120 – ₹220",
    "buy_url": "https://www.microchip.com/en-us/product/pic18f47q10",
    "datasheet_url": "https://ww1.microchip.com/downloads/aemDocuments/documents/MCU08/ProductDocuments/DataSheets/PIC18(L)F26-27-45-46-47-55-56-57Q10-Data-Sheet-40001919.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "MCLR/VPP", "pin_type": "other", "description": "Active-low reset, or programming voltage input." },
    { "pin_number": "2", "pin_name": "RA0/AN0", "pin_type": "adc", "description": "General I/O or 12-bit ADC channel 0." },
    { "pin_number": "3", "pin_name": "RA1/AN1", "pin_type": "adc", "description": "General I/O or 12-bit ADC channel 1." },
    { "pin_number": "11", "pin_name": "VDD", "pin_type": "power", "description": "1.8V – 5.5V supply." },
    { "pin_number": "12", "pin_name": "VSS", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "18", "pin_name": "RC6/TX1", "pin_type": "comm", "description": "EUSART1 transmit (default)." },
    { "pin_number": "17", "pin_name": "RC7/RX1", "pin_type": "comm", "description": "EUSART1 receive (default)." },
    { "pin_number": "27", "pin_name": "RD1/SDA1", "pin_type": "comm", "description": "MSSP1 I2C data line (remappable)." },
    { "pin_number": "28", "pin_name": "RD0/SCL1", "pin_type": "comm", "description": "MSSP1 I2C clock line (remappable)." },
    { "pin_number": "23", "pin_name": "RC3/SCK1", "pin_type": "comm", "description": "MSSP1 SPI clock (remappable)." },
    { "pin_number": "24", "pin_name": "RC4/SDI1", "pin_type": "comm", "description": "MSSP1 SPI data in (remappable)." },
    { "pin_number": "25", "pin_name": "RC5/SDO1", "pin_type": "comm", "description": "MSSP1 SPI data out (remappable)." },
    { "pin_number": "34", "pin_name": "RD6/PWM", "pin_type": "pwm", "description": "CCP/PWM-capable GPIO." }
  ]
},
{
  "mc": {
    "slug": "avr128da48",
    "name": "AVR128DA48",
    "manufacturer": "Microchip Technology",
    "architecture": "8-bit AVR (AVR DA-series)",
    "short_description": "A modern high-pin-count AVR that pairs the familiar 8-bit AVR core with Core Independent Peripherals borrowed from Microchip's PIC line.",
    "long_description": "The AVR128DA48 is part of Microchip's AVR DA-series, aimed at designs that want the classic AVR instruction set and toolchain but with more flash, more UART/SPI/TWI instances, an event system, and Core Independent Peripherals for hardware-level logic. It's a natural upgrade path for teams already invested in AVR who've outgrown the ATmega line.",
    "clock_speed": "Up to 24 MHz",
    "flash_memory": "128 KB",
    "ram": "16 KB SRAM",
    "operating_voltage": "1.8V – 5.5V",
    "io_pins_count": 41,
    "adc_channels": "22 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "TQFP-48 / QFN-48",
    "price_range": "₹150 – ₹280",
    "buy_url": "https://www.microchip.com/en-us/product/avr128da48",
    "datasheet_url": "https://ww1.microchip.com/downloads/aemDocuments/documents/MCU08/ProductDocuments/DataSheets/AVR128DA28-32-48-64-Data-Sheet-40002183.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "PA0/XTAL1", "pin_type": "other", "description": "General I/O or external crystal input." },
    { "pin_number": "2", "pin_name": "PA1/XTAL2", "pin_type": "other", "description": "General I/O or external crystal output." },
    { "pin_number": "9", "pin_name": "VDD", "pin_type": "power", "description": "1.8V – 5.5V supply." },
    { "pin_number": "10", "pin_name": "GND", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "11", "pin_name": "PC0/AIN12", "pin_type": "adc", "description": "General I/O or 12-bit ADC channel." },
    { "pin_number": "12", "pin_name": "PC1/AIN13", "pin_type": "adc", "description": "General I/O or 12-bit ADC channel." },
    { "pin_number": "17", "pin_name": "PC2/TXD0", "pin_type": "comm", "description": "USART0 transmit (default)." },
    { "pin_number": "18", "pin_name": "PC3/RXD0", "pin_type": "comm", "description": "USART0 receive (default)." },
    { "pin_number": "13", "pin_name": "PC4/SDA0", "pin_type": "comm", "description": "TWI0 (I2C) data line (default)." },
    { "pin_number": "14", "pin_name": "PC5/SCL0", "pin_type": "comm", "description": "TWI0 (I2C) clock line (default)." },
    { "pin_number": "21", "pin_name": "PC6/SCK0", "pin_type": "comm", "description": "SPI0 clock (default)." },
    { "pin_number": "22", "pin_name": "PC7/MOSI0", "pin_type": "comm", "description": "SPI0 data out (default)." },
    { "pin_number": "36", "pin_name": "PD4/WO2", "pin_type": "pwm", "description": "TCA0 waveform-output PWM pin." }
  ]
},
{
  "mc": {
    "slug": "mspm0g3507",
    "name": "MSPM0G3507",
    "manufacturer": "Texas Instruments",
    "architecture": "32-bit ARM Cortex-M0+",
    "short_description": "TI's newer low-cost Cortex-M0+ line, positioned as the general-purpose successor to a lot of classic MSP430 designs.",
    "long_description": "The MSPM0G3507 is part of TI's MSPM0 family, launched to give MSP430 customers (and anyone wanting a cheap general-purpose MCU) an Arm Cortex-M0+ option with a fast 12-bit ADC, built-in op-amps, and a hardware math accelerator, at a similar price point to the 8/16-bit chips it's meant to replace in new designs.",
    "clock_speed": "Up to 80 MHz",
    "flash_memory": "128 KB",
    "ram": "32 KB SRAM",
    "operating_voltage": "1.62V – 3.6V",
    "io_pins_count": 30,
    "adc_channels": "8 (12-bit)",
    "communication": "I2C,SPI,UART,CAN",
    "package_type": "LQFP-32 / VQFN-32",
    "price_range": "₹90 – ₹160",
    "buy_url": "https://www.ti.com/product/MSPM0G3507",
    "datasheet_url": "https://www.ti.com/lit/ds/symlink/mspm0g3507.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "VDD", "pin_type": "power", "description": "1.62V – 3.6V supply." },
    { "pin_number": "2", "pin_name": "VSS", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "3", "pin_name": "PA0/SWCLK", "pin_type": "other", "description": "Serial Wire debug clock, or general I/O." },
    { "pin_number": "4", "pin_name": "PA1/SWDIO", "pin_type": "other", "description": "Serial Wire debug data, or general I/O." },
    { "pin_number": "9", "pin_name": "PA27/AIN0", "pin_type": "adc", "description": "General I/O or 12-bit ADC channel 0." },
    { "pin_number": "10", "pin_name": "PA26/AIN1", "pin_type": "adc", "description": "General I/O or 12-bit ADC channel 1." },
    { "pin_number": "15", "pin_name": "PA10/TX", "pin_type": "comm", "description": "UART0 transmit (default)." },
    { "pin_number": "16", "pin_name": "PA11/RX", "pin_type": "comm", "description": "UART0 receive (default)." },
    { "pin_number": "13", "pin_name": "PA0/SDA", "pin_type": "comm", "description": "I2C0 data line (remappable)." },
    { "pin_number": "14", "pin_name": "PA1/SCL", "pin_type": "comm", "description": "I2C0 clock line (remappable)." },
    { "pin_number": "20", "pin_name": "PA17/CANTX", "pin_type": "comm", "description": "MCAN transmit (default)." },
    { "pin_number": "21", "pin_name": "PA18/CANRX", "pin_type": "comm", "description": "MCAN receive (default)." },
    { "pin_number": "25", "pin_name": "PB2/PWM", "pin_type": "pwm", "description": "TIMG-driven PWM-capable GPIO." }
  ]
},
{
  "mc": {
    "slug": "numicro-m031ld2ae",
    "name": "NuMicro M031LD2AE",
    "manufacturer": "Nuvoton Technology",
    "architecture": "32-bit ARM Cortex-M0",
    "short_description": "An affordable Taiwanese Cortex-M0 line built for consumer electronics, appliance control, and small-appliance retrofits.",
    "long_description": "Nuvoton is one of the larger Taiwan-based MCU vendors, and the NuMicro M031 series is its general-purpose low-cost Cortex-M0 lineup. The 'LD' variant adds an internal LDO regulator for lower system BOM cost, and the series is widely used inside smart-home devices, small appliances, and simple industrial control panels across Asian supply chains.",
    "clock_speed": "Up to 48 MHz",
    "flash_memory": "64 KB",
    "ram": "8 KB SRAM",
    "operating_voltage": "2.5V – 5.5V",
    "io_pins_count": 29,
    "adc_channels": "12 (12-bit)",
    "communication": "I2C,SPI,UART",
    "package_type": "LQFP-32",
    "price_range": "₹60 – ₹120",
    "buy_url": "https://www.nuvoton.com/products/microcontrollers/arm-cortex-m0-mcus/m031-series/",
    "datasheet_url": "https://www.nuvoton.com/products/microcontrollers/arm-cortex-m0-mcus/m031-series/"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "VDD", "pin_type": "power", "description": "2.5V – 5.5V supply." },
    { "pin_number": "2", "pin_name": "VSS", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "3", "pin_name": "PF0/ICE_DAT", "pin_type": "other", "description": "Nu-Link debug data, or general I/O." },
    { "pin_number": "4", "pin_name": "PF1/ICE_CLK", "pin_type": "other", "description": "Nu-Link debug clock, or general I/O." },
    { "pin_number": "9", "pin_name": "PA0/AIN0", "pin_type": "adc", "description": "General I/O or 12-bit ADC channel 0." },
    { "pin_number": "10", "pin_name": "PA1/AIN1", "pin_type": "adc", "description": "General I/O or 12-bit ADC channel 1." },
    { "pin_number": "15", "pin_name": "PB0/TXD0", "pin_type": "comm", "description": "UART0 transmit (default)." },
    { "pin_number": "16", "pin_name": "PB1/RXD0", "pin_type": "comm", "description": "UART0 receive (default)." },
    { "pin_number": "17", "pin_name": "PB4/SDA0", "pin_type": "comm", "description": "I2C0 data line (default)." },
    { "pin_number": "18", "pin_name": "PB5/SCL0", "pin_type": "comm", "description": "I2C0 clock line (default)." },
    { "pin_number": "21", "pin_name": "PC0/SPICLK", "pin_type": "comm", "description": "SPI0 clock (default)." },
    { "pin_number": "26", "pin_name": "PD2/PWM0", "pin_type": "pwm", "description": "BPWM-capable GPIO." }
  ]
},
{
  "mc": {
    "slug": "bouffalo-bl616",
    "name": "BL616",
    "manufacturer": "Bouffalo Lab",
    "architecture": "32-bit single-core RISC-V (T-Head E907)",
    "short_description": "A cheap Chinese RISC-V SoC with Wi-Fi 6, Bluetooth 5.x, and Zigbee/Thread radios all on one chip.",
    "long_description": "The BL616 occupies a similar niche to the ESP32 family — a low-cost wireless SoC for hobbyist and small commercial IoT boards — but built around a single T-Head E907 RISC-V core instead of Xtensa or Arm. It bundles Wi-Fi 6, Bluetooth LE 5.x, and 802.15.4 (Zigbee/Thread/Matter) radios, and has become a popular budget alternative on RISC-V-focused dev boards.",
    "clock_speed": "Up to 320 MHz",
    "flash_memory": "Up to 2 MB (varies by module)",
    "ram": "532 KB SRAM",
    "operating_voltage": "3.0V – 3.6V",
    "io_pins_count": 24,
    "adc_channels": "4 (12-bit)",
    "communication": "WiFi,BLE,I2C,SPI,UART",
    "package_type": "QFN-68 (module on dev board)",
    "price_range": "₹150 – ₹300",
    "buy_url": "https://www.bouffalolab.com/bl616",
    "datasheet_url": "https://github.com/bouffalolab/bl_docs"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "3V3", "pin_type": "power", "description": "3.3V power input/output for the board." },
    { "pin_number": "2", "pin_name": "GND", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "3", "pin_name": "EN", "pin_type": "other", "description": "Chip enable, active high." },
    { "pin_number": "4", "pin_name": "GPIO0", "pin_type": "gpio", "description": "General GPIO, also a boot-mode strapping pin." },
    { "pin_number": "5", "pin_name": "GPIO1/AIN0", "pin_type": "adc", "description": "General GPIO or 12-bit ADC channel 0." },
    { "pin_number": "6", "pin_name": "GPIO14/TXD", "pin_type": "comm", "description": "UART0 transmit (default)." },
    { "pin_number": "7", "pin_name": "GPIO15/RXD", "pin_type": "comm", "description": "UART0 receive (default)." },
    { "pin_number": "8", "pin_name": "GPIO3/SDA", "pin_type": "comm", "description": "Default I2C SDA line." },
    { "pin_number": "9", "pin_name": "GPIO4/SCL", "pin_type": "comm", "description": "Default I2C SCL line." },
    { "pin_number": "10", "pin_name": "GPIO17/SCK", "pin_type": "comm", "description": "SPI clock (default)." },
    { "pin_number": "11", "pin_name": "GPIO18/MOSI", "pin_type": "comm", "description": "SPI data out (default)." },
    { "pin_number": "12", "pin_name": "GPIO12/PWM", "pin_type": "pwm", "description": "Timer-driven PWM-capable GPIO." }
  ]
},
{
  "mc": {
    "slug": "realtek-rtl8720dn",
    "name": "RTL8720DN",
    "manufacturer": "Realtek Semiconductor",
    "architecture": "32-bit dual-core ARM (Cortex-M4 high-performance + Cortex-M0 low-power)",
    "short_description": "A Realtek Wi-Fi + Bluetooth SoC used in Amebad-family dev boards, pairing a Cortex-M4 application core with a low-power Cortex-M0.",
    "long_description": "The RTL8720DN is the SoC behind Realtek's 'Amebad' dev board ecosystem (used by boards like the Seeed Studio XIAO variants). It splits work across a Cortex-M4 application core and a separate low-power Cortex-M0, with integrated 2.4 GHz Wi-Fi and Bluetooth LE — aimed at Matter and smart-home projects that want an alternative to the ESP32 family.",
    "clock_speed": "Up to 200 MHz",
    "flash_memory": "2 MB",
    "ram": "512 KB SRAM",
    "operating_voltage": "3.0V – 3.6V",
    "io_pins_count": 21,
    "adc_channels": "1 (12-bit)",
    "communication": "WiFi,BLE,I2C,SPI,UART",
    "package_type": "QFN-68 (module on dev board)",
    "price_range": "₹300 – ₹550",
    "buy_url": "https://www.realtek.com/en/products/communications-network-ics/item/rtl8720dn",
    "datasheet_url": "https://www.amebaiot.com/en/amebad-overview/"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "3V3", "pin_type": "power", "description": "3.3V power input/output for the board." },
    { "pin_number": "2", "pin_name": "GND", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "3", "pin_name": "EN", "pin_type": "other", "description": "Chip enable, active high." },
    { "pin_number": "4", "pin_name": "PA12", "pin_type": "gpio", "description": "General-purpose I/O." },
    { "pin_number": "5", "pin_name": "PA13/AIN0", "pin_type": "adc", "description": "General I/O or 12-bit ADC input." },
    { "pin_number": "6", "pin_name": "PA18/TXD", "pin_type": "comm", "description": "UART0 transmit (default)." },
    { "pin_number": "7", "pin_name": "PA19/RXD", "pin_type": "comm", "description": "UART0 receive (default)." },
    { "pin_number": "8", "pin_name": "PA23/SDA", "pin_type": "comm", "description": "Default I2C SDA line." },
    { "pin_number": "9", "pin_name": "PA24/SCL", "pin_type": "comm", "description": "Default I2C SCL line." },
    { "pin_number": "10", "pin_name": "PA30/SCK", "pin_type": "comm", "description": "SPI clock (default)." },
    { "pin_number": "11", "pin_name": "PA26/PWM", "pin_type": "pwm", "description": "Timer-driven PWM-capable GPIO." }
  ]
},
{
  "mc": {
    "slug": "renesas-ra6m4",
    "name": "RA6M4",
    "manufacturer": "Renesas Electronics",
    "architecture": "32-bit ARM Cortex-M33",
    "short_description": "A performance-tier Renesas RA MCU with TrustZone security and Ethernet, aimed at connected industrial gear.",
    "long_description": "The RA6M4 sits above the RA4 series in Renesas' RA lineup, adding a faster Cortex-M33 core, CAN FD, a 10/100 Ethernet MAC, and a hardware crypto accelerator with Arm TrustZone-M support. It's a common choice for connected industrial controllers and gateway devices that need both networking and a documented security story.",
    "clock_speed": "Up to 200 MHz",
    "flash_memory": "1 MB",
    "ram": "256 KB SRAM",
    "operating_voltage": "2.7V – 3.6V",
    "io_pins_count": 98,
    "adc_channels": "21 (14-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,I2S",
    "package_type": "LQFP-144 / LQFP-100",
    "price_range": "₹350 – ₹650",
    "buy_url": "https://www.renesas.com/en/products/microcontrollers-microprocessors/ra-cortex-m-mcus/ra6m4-32-bit-microcontrollers-200mhz-arm-cortex-m33-trustzone-and-ethernet",
    "datasheet_url": "https://www.renesas.com/en/document/dst/ra6m4-group-datasheet"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "VCC", "pin_type": "power", "description": "2.7V – 3.6V main supply." },
    { "pin_number": "2", "pin_name": "VSS", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "3", "pin_name": "P109/SWDIO", "pin_type": "other", "description": "Serial Wire debug data, or general I/O." },
    { "pin_number": "4", "pin_name": "P108/SWCLK", "pin_type": "other", "description": "Serial Wire debug clock, or general I/O." },
    { "pin_number": "9", "pin_name": "P000/AN000", "pin_type": "adc", "description": "General I/O or 14-bit ADC channel 0." },
    { "pin_number": "10", "pin_name": "P001/AN001", "pin_type": "adc", "description": "General I/O or 14-bit ADC channel 1." },
    { "pin_number": "20", "pin_name": "P411/TXD9", "pin_type": "comm", "description": "SCI9 UART transmit (default)." },
    { "pin_number": "21", "pin_name": "P410/RXD9", "pin_type": "comm", "description": "SCI9 UART receive (default)." },
    { "pin_number": "22", "pin_name": "P401/SDA0", "pin_type": "comm", "description": "IIC0 data line (default)." },
    { "pin_number": "23", "pin_name": "P400/SCL0", "pin_type": "comm", "description": "IIC0 clock line (default)." },
    { "pin_number": "30", "pin_name": "P205/CTX0", "pin_type": "comm", "description": "CAN FD channel 0 transmit." },
    { "pin_number": "31", "pin_name": "P206/CRX0", "pin_type": "comm", "description": "CAN FD channel 0 receive." },
    { "pin_number": "45", "pin_name": "P112/USB_DP", "pin_type": "comm", "description": "USB full-speed D+ line." },
    { "pin_number": "50", "pin_name": "P600/PWM", "pin_type": "pwm", "description": "GPT-driven PWM-capable GPIO." }
  ]
},
{
  "mc": {
    "slug": "same54-xplained-pro",
    "name": "SAM E54 Xplained Pro",
    "manufacturer": "Microchip Technology",
    "architecture": "32-bit ARM Cortex-M4F",
    "short_description": "A Cortex-M4F dev board with a built-in 10/100 Ethernet MAC, aimed at industrial and networked embedded designs.",
    "long_description": "The SAM E54 extends Microchip's SAM D5x Cortex-M4F line with an Ethernet MAC, CAN FD, and high-speed USB — common in EtherCAT and general industrial-networking prototyping. The Xplained Pro board pairs the chip with an on-board debugger and expansion headers, so it's usually the starting point rather than the bare chip.",
    "clock_speed": "Up to 120 MHz",
    "flash_memory": "1 MB",
    "ram": "256 KB SRAM",
    "operating_voltage": "1.62V – 3.6V",
    "io_pins_count": 90,
    "adc_channels": "18 (12-bit)",
    "communication": "I2C,SPI,UART,USB,CAN,I2S",
    "package_type": "TQFP-128 (module on board)",
    "price_range": "₹1200 – ₹1900",
    "buy_url": "https://www.microchip.com/en-us/development-tool/atsame54-xpro",
    "datasheet_url": "https://ww1.microchip.com/downloads/aemDocuments/documents/MCU32/ProductDocuments/DataSheets/SAM-E54-Family-Data-Sheet-DS60001507.pdf"
  },
  "pins": [
    { "pin_number": "1", "pin_name": "VDDIO", "pin_type": "power", "description": "1.62V – 3.6V I/O supply." },
    { "pin_number": "2", "pin_name": "GND", "pin_type": "ground", "description": "Ground reference." },
    { "pin_number": "3", "pin_name": "PA30/SWCLK", "pin_type": "other", "description": "Serial Wire debug clock, or general I/O." },
    { "pin_number": "4", "pin_name": "PA31/SWDIO", "pin_type": "other", "description": "Serial Wire debug data, or general I/O." },
    { "pin_number": "9", "pin_name": "PA02/AIN0", "pin_type": "adc", "description": "General I/O or 12-bit ADC channel 0." },
    { "pin_number": "10", "pin_name": "PA03/AIN1", "pin_type": "adc", "description": "General I/O or 12-bit ADC channel 1." },
    { "pin_number": "20", "pin_name": "PB24/TXD", "pin_type": "comm", "description": "SERCOM UART transmit (default)." },
    { "pin_number": "21", "pin_name": "PB25/RXD", "pin_type": "comm", "description": "SERCOM UART receive (default)." },
    { "pin_number": "22", "pin_name": "PA12/SDA", "pin_type": "comm", "description": "SERCOM I2C data line (default)." },
    { "pin_number": "23", "pin_name": "PA13/SCL", "pin_type": "comm", "description": "SERCOM I2C clock line (default)." },
    { "pin_number": "35", "pin_name": "PC11/RMII_TXD0", "pin_type": "comm", "description": "Ethernet MAC RMII transmit data 0." },
    { "pin_number": "36", "pin_name": "PC12/RMII_TXD1", "pin_type": "comm", "description": "Ethernet MAC RMII transmit data 1." },
    { "pin_number": "48", "pin_name": "PA24/USB_DM", "pin_type": "comm", "description": "USB high-speed D- line." },
    { "pin_number": "60", "pin_name": "PB08/PWM", "pin_type": "pwm", "description": "TCC-driven PWM-capable GPIO." }
  ]
}
  ];

  const insertAll = db.transaction((items) => {
    for (const item of items) {
      const info = insertMc.run(item.mc);
      const mcId = info.lastInsertRowid;
      for (const pin of item.pins) {
        insertPin.run({ microcontroller_id: mcId, ...pin });
      }
    }
  });

  insertAll(seed);
  console.log(`Seeded ${seed.length} microcontrollers into the database.`);
}

export default db;
