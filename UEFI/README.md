# Loading a UEFI .efi Binary in GRUB2

## 1. Confirm You’re in UEFI Mode  
- GRUB must be running under UEFI to launch an EFI payload.  
- If you see firmware-specific commands (e.g. `fwsetup`) at the GRUB prompt or your ESP is mounted at `/boot/efi`, you’re in UEFI mode.

## 2. Mount the EFI System Partition (ESP)  
1. Identify your EFI partition (type `EF00`, usually FAT32).  
2. Create and mount it:
   ```bash
   sudo mkdir -p /boot/efi
   sudo mount /dev/sdXY /boot/efi
   ```
   Here `/dev/sdXY` is your ESP. In ArchWiki, “esp” denotes the mountpoint of the EFI system partition aka ESP.

## 3. Copy the EFI Binary  
Choose a folder under the ESP (e.g. `EFI/tools`) and copy your file:
```bash
sudo mkdir -p /boot/efi/EFI/tools
sudo cp mtest-x64.efi /boot/efi/EFI/tools/
```

## 4. Create a Custom GRUB Menu Entry  
Edit `/etc/grub.d/40_custom` (or `/etc/grub2.d/40_custom`) and add:
```bash
menuentry "UEFI Memory Test (mtest-x64.efi)" {
    insmod part_gpt
    insmod fat
    search --no-floppy --file --set=root /EFI/tools/mtest-x64.efi
    chainloader /EFI/tools/mtest-x64.efi
}
```
- `insmod fat` loads FAT-filesystem support.  
- `search … --set=root` finds the ESP by filename.  
- `chainloader` hands control to the EFI binary.

## 5. Regenerate `grub.cfg`  
- Debian/Ubuntu:
  ```bash
  sudo update-grub
  ```
- Fedora/RHEL:
  ```bash
  sudo grub2-mkconfig -o /boot/efi/EFI/fedora/grub.cfg
  ```
Adjust the output path to match your distribution’s layout.

## 6. Reboot and Test  
On reboot you’ll see “UEFI Memory Test (mtest-x64.efi)” in GRUB. Select it to launch your `.efi` payload.

---

## Troubleshooting & Tips  
- If it fails, drop to the grub prompt and use `ls (hd0,gpt1)/EFI/tools/` to verify the file’s presence.  
- For BIOS-booted GRUB on GPT disks, swap `insmod part_gpt` with `insmod part_msdos`.  
- You can use `search --fs-uuid <UUID> --set=root` if you prefer UUID-based lookup.  
- Make sure your ESP is FAT32 and flagged as EFI in `gdisk`/`fdisk`.

https://copilot.microsoft.com/shares/ZaXurizC6dgQBY92kBsXn

---
# Creating a GPT Layout on /dev/sda with gdisk (Ubuntu 24.04.1)

Follow these steps to carve /dev/sda into five GPT partitions—ESP, FAT32 boot, swap, ext4 root, and NTFS—using `gdisk`. We’ll also set the EFI System Partition (ESP) as your boot partition.

---

## Prerequisites

- A blank 250 GB disk at `/dev/sda` (no existing partitions).  
- Ubuntu 24.04.1 running, with `sudo` privileges.  
- `gdisk` installed:  
  ```bash
  sudo apt update
  sudo apt install gdisk
  ```

---

## 1. Start gdisk

Open the fresh disk with:

```bash
sudo gdisk /dev/sda
```

You’ll see a prompt:

```
GPT fdisk (gdisk) version x.x.x

Partition table scan:
  MBR: not present
  BSD: not present
  APM: not present
  GPT: not present

Creating new GPT entries.

Command (? for help):
```

---

## 2. Create a New GPT Table

At the `Command` prompt, type:

```
o
```

– This initializes a new GPT.  
– Confirm with `y`.

---

## 3. Partition 1: EFI System Partition (100 MiB)

1.  Command:  
    ```
    n
    ```
2.  Partition number: press **Enter** (defaults to 1).  
3.  First sector: press **Enter** (use default).  
4.  Last sector: type  
    ```
    +100M
    ```  
5.  Hex code or GUID: type  
    ```
    EF00
    ```  
6.  Label: type  
    ```
    EFI
    ```

---

## 4. Partition 2: FAT32 “boot” (300 MiB)

1.  Command:
    ```
    n
    ```
2.  Number: **Enter** (2).  
3.  First sector: **Enter**.  
4.  Last sector:
    ```
    +300M
    ```
5.  Hex code:  
    ```
    0700
    ```  
6.  Label:
    ```
    boot
    ```

---

## 5. Partition 3: Linux Swap (8 GiB)

1.  Command:
    ```
    n
    ```
2.  Number: **Enter** (3).  
3.  First sector: **Enter**.  
4.  Last sector:
    ```
    +8G
    ```
5.  Hex code:  
    ```
    8200
    ```
6.  Label:
    ```
    swap
    ```

---

## 6. Partition 4: ext4 Root (100 GiB)

1.  Command:
    ```
    n
    ```
2.  Number: **Enter** (4).  
3.  First sector: **Enter**.  
4.  Last sector:
    ```
    +100G
    ```
5.  Hex code:  
    ```
    8300
    ```
6.  Label:
    ```
    root
    ```

---

## 7. Partition 5: NTFS (Remaining ≃ 137.6 GiB)

1.  Command:
    ```
    n
    ```
2.  Number: **Enter** (5).  
3.  First sector: **Enter**.  
4.  Last sector: press **Enter** (use all remaining space).  
5.  Hex code:
    ```
    0700
    ```
6.  Label:
    ```
    windows
    ```

---

## 8. (Optional) Mark ESP as Bootable for Legacy

GPT recognizes EF00 as the EFI System Partition.  If you also want the legacy-BIOS “bootable” flag:

1.  At `Command`:  
    ```
    x
    ```
2.  At `Expert command`:  
    ```
    a
    ```
3.  Partition number:  
    ```
    1
    ```
4.  Attribute hex code:  
    ```
    2
    ```
5.  Back to expert menu:
    ```
    m
    ```

---

## 9. Review and Write Changes

1.  Print the table:
    ```
    p
    ```
2.  If all looks correct, write and exit:
    ```
    w
    ```
3.  Confirm with `y`.

---

## 10. Format & Mount

After reboot (or rescanning the partition table), format and mount:

```bash
# ESP (FAT32)
sudo mkfs.fat -F32 /dev/sda1
sudo mkdir -p /boot/efi
sudo mount /dev/sda1 /boot/efi

# boot (FAT32)
sudo mkfs.fat -F32 /dev/sda2
sudo mkdir -p /boot
sudo mount /dev/sda2 /boot

# swap
sudo mkswap /dev/sda3
sudo swapon /dev/sda3

# root (ext4)
sudo mkfs.ext4 /dev/sda4
sudo mkdir -p /mnt/root
sudo mount /dev/sda4 /mnt/root

# windows (NTFS)
sudo mkfs.ntfs /dev/sda5
sudo mkdir -p /mnt/windows
sudo mount /dev/sda5 /mnt/windows
```

---

## Partition Layout Summary

| #  | Start   | End      | Size    | Type               | Code | Label   |
|----|---------|----------|---------|--------------------|------|---------|
| 1  | default | +100 M   | 100 MiB | EFI System         | EF00 | EFI     |
| 2  | —       | +300 M   | 300 MiB | FAT32 (boot)       | 0700 | boot    |
| 3  | —       | +8 GiB   | 8 GiB   | Linux swap         | 8200 | swap    |
| 4  | —       | +100 GiB | 100 GiB | Linux filesystem   | 8300 | root    |
| 5  | —       | —        | ~137.6 GiB | Microsoft Basic  | 0700 | windows |

You now have a GPT disk with a dedicated EFI System Partition ready for UEFI boot.

https://copilot.microsoft.com/shares/oR3CHcWaGnZWso7pKZLX7
