#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

# 테스트 파일 목록
test_files = [
    'src/test/java/tvframework/com/jwt/JwtAuthenticationFilterTest.java',
    'src/test/java/tvframework/study/jpa/JpaTest.java',
    'src/test/java/tvframework/study/jpa/QueryDslTest.java',
    'src/test/java/tvframework/study/jpa/domain/Member.java',
    'src/test/java/tvframework/study/jpa/domain/Team.java',
    'src/test/java/tvframework/study/jpa/domain/Locker.java',
]

# 변경 패턴
replacements = [
    (r'import javax\.servlet\.FilterChain;', 'import jakarta.servlet.FilterChain;'),
    (r'import javax\.persistence\.\*;', 'import jakarta.persistence.*;'),
    (r'import javax\.persistence\.Entity;', 'import jakarta.persistence.Entity;'),
    (r'import javax\.persistence\.Id;', 'import jakarta.persistence.Id;'),
    (r'import javax\.persistence\.OneToMany;', 'import jakarta.persistence.OneToMany;'),
    (r'import javax\.persistence\.OneToOne;', 'import jakarta.persistence.OneToOne;'),
    (r'import javax\.persistence\.ManyToOne;', 'import jakarta.persistence.ManyToOne;'),
    (r'import javax\.persistence\.JoinColumn;', 'import jakarta.persistence.JoinColumn;'),
    (r'import javax\.persistence\.CascadeType;', 'import jakarta.persistence.CascadeType;'),
    (r'import javax\.persistence\.criteria\.CriteriaBuilder;', 'import jakarta.persistence.criteria.CriteriaBuilder;'),
    (r'import javax\.persistence\.criteria\.CriteriaQuery;', 'import jakarta.persistence.criteria.CriteriaQuery;'),
    (r'import javax\.persistence\.criteria\.Root;', 'import jakarta.persistence.criteria.Root;'),
    (r'javax\.persistence\.', 'jakarta.persistence.'),
]

for file_path in test_files:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 패턴 교체
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {file_path}")
    else:
        print(f"No changes needed: {file_path}")

print("All test files processed!")

