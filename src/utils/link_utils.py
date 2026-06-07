import random
from string import ascii_letters, digits
from src.core import settings
import re


def generate_new_slug() -> str:
    return ''.join(random.sample(digits+ascii_letters, settings.SLUG_LENGTH))


URL_REGEXP = re.compile(
    r'^https?://'  
    r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
    r'localhost|' 
    r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  
    r'(?::\d+)?' 
    r'(?:/?|[/?]\S+)$', re.IGNORECASE
)

def is_valid_url(url: str) -> bool:
    return URL_REGEXP.match(url)
