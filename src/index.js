/*
  call credit transfer
  call progress transfer
  settimeout for 10 sec:
    success message
    end process 0

  all errors will:
    end function(s)
    settimeout for 10 minutes:
      detailed error message
      end process 1? (double check best practice exit code)
*/