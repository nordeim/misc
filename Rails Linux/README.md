```bash
split -b 20M /Home1/rails.tgz rails_part_  

split -n 6 /Home1/rails.tgz rails_part_  

cat rails_part_* > rails_restored.tgz  

split -b 20M -d --verbose /Home1/rails.tgz rails_part_  
-d: Uses numeric suffixes (00, 01, 02) instead of letters (aa, ab, ac).  
--verbose: Shows progress as each new chunk is created.  
```

https://share.google/aimode/YrEy3o65K6EjOaOWg 
