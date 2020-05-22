Feature:
  As a device
  I want to report my status
  So Kevin knows when the batteries are running low

  Scenario: Report status
    Given I am logged in as an administrator
    When device "123456" reports a status "04 12 88 04 00 00 00 25 20 20 03 09 02 38 00 00 17 65 38 46 00 06 00 00 00 00"
    Then the last status update from device "123456" should be "04 12 88 04 00 00 00 25 20 20 03 09 02 38 00 00 17 65 38 46 00 06 00 00 00 00"
